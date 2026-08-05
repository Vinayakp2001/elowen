"""
Shared test fixtures for the Elowen API test suite.

- Creates a temporary Payload-like SQLite DB for cart_service tests
- Creates an in-memory SQLModel session for coupon/webhook tests
- Provides a FastAPI TestClient with overridden dependencies for webhook tests
"""

import os
import sqlite3
import tempfile
from decimal import Decimal
from typing import Generator

import pytest
from sqlmodel import SQLModel, Session, create_engine, select
from fastapi.testclient import TestClient
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.ext.compiler import compiles
from sqlalchemy.pool import StaticPool

# Set test env vars BEFORE importing app modules
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")
os.environ.setdefault("STRIPE_SECRET_KEY", "sk_test_dummy")
os.environ.setdefault("STRIPE_WEBHOOK_SECRET", "whsec_test_dummy")
os.environ.setdefault("FRONTEND_URL", "http://localhost:3000")
os.environ.setdefault("ENVIRONMENT", "test")
os.environ.setdefault("JWT_SECRET_KEY", "test-secret")


# ---------------------------------------------------------------------------
# SQLite compatibility: render PostgreSQL JSONB as plain JSON in tests
# ---------------------------------------------------------------------------

@compiles(JSONB, "sqlite")
def _jsonb_to_json_sqlite(type_, compiler, **kw):
    """SQLite has no native JSONB; fall back to JSON."""
    return compiler.visit_JSON(type_)


import app.database as _database
from app.database import get_session
from app.main import app
from app.models.coupon import Coupon
from app.models.webhook import WebhookEvent


# ---------------------------------------------------------------------------
# In-memory SQLModel engine (for coupon + webhook tests)
# ---------------------------------------------------------------------------
# StaticPool guarantees a single shared connection across all threads
# (TestClient runs the ASGI app in a portal thread), so tables created by
# _create_tables are visible inside the request handler.

test_engine = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

# Replace the production engine so the app lifespan (create_db_and_tables)
# also targets the same in-memory database.
_database.engine = test_engine


@pytest.fixture(autouse=True)
def _create_tables():
    """Create all SQLModel tables before each test, drop after."""
    SQLModel.metadata.create_all(test_engine)
    yield
    SQLModel.metadata.drop_all(test_engine)


@pytest.fixture()
def db_session() -> Generator[Session, None, None]:
    """Yields a SQLModel Session backed by the in-memory engine."""
    with Session(test_engine) as session:
        yield session


@pytest.fixture()
def client(db_session: Session) -> Generator[TestClient, None, None]:
    """FastAPI TestClient with get_session overridden to use the test DB."""
    def _override_get_session():
        yield db_session

    app.dependency_overrides[get_session] = _override_get_session
    yield TestClient(app)
    app.dependency_overrides.clear()


# ---------------------------------------------------------------------------
# Payload-like SQLite DB for cart_service tests
# ---------------------------------------------------------------------------

@pytest.fixture()
def payload_db(tmp_path) -> str:
    """
    Creates a temporary SQLite file mimicking Payload's `products` table.
    Returns the file path. The cart_service reads this via PAYLOAD_DB_PATH.
    """
    db_path = str(tmp_path / "payload_test.db")
    conn = sqlite3.connect(db_path)
    conn.execute("""
        CREATE TABLE products (
            id INTEGER PRIMARY KEY,
            title TEXT,
            sku TEXT,
            price REAL,
            in_stock INTEGER
        )
    """)
    # Insert test products
    conn.executemany(
        "INSERT INTO products (id, title, sku, price, in_stock) VALUES (?, ?, ?, ?, ?)",
        [
            (1, "Gold Ring", "RING-001", 1250.00, 1),    # in stock, price 1250
            (2, "Silver Necklace", "NECK-001", 450.00, 0),  # out of stock
            (3, "Diamond Earrings", "EAR-001", 3200.00, 1),  # in stock, price 3200
        ],
    )
    conn.commit()
    conn.close()
    return db_path


# ---------------------------------------------------------------------------
# Coupon fixtures
# ---------------------------------------------------------------------------

@pytest.fixture()
def percent_coupon(db_session: Session) -> Coupon:
    """A valid 10% off coupon."""
    coupon = Coupon(
        code="WELCOME10",
        discount_type="percent",
        discount_value=Decimal("10"),
        max_uses=100,
        uses_count=0,
        active=True,
    )
    db_session.add(coupon)
    db_session.commit()
    db_session.refresh(coupon)
    return coupon


@pytest.fixture()
def fixed_coupon(db_session: Session) -> Coupon:
    """A valid $50 off coupon."""
    coupon = Coupon(
        code="FLAT50",
        discount_type="fixed",
        discount_value=Decimal("50"),
        max_uses=None,
        uses_count=0,
        active=True,
    )
    db_session.add(coupon)
    db_session.commit()
    db_session.refresh(coupon)
    return coupon


@pytest.fixture()
def expired_coupon(db_session: Session) -> Coupon:
    """An expired coupon."""
    from datetime import datetime, timedelta
    coupon = Coupon(
        code="EXPIRED20",
        discount_type="percent",
        discount_value=Decimal("20"),
        active=True,
        expires_at=datetime.utcnow() - timedelta(days=1),
    )
    db_session.add(coupon)
    db_session.commit()
    db_session.refresh(coupon)
    return coupon


@pytest.fixture()
def inactive_coupon(db_session: Session) -> Coupon:
    """An inactive coupon."""
    coupon = Coupon(
        code="INACTIVE5",
        discount_type="fixed",
        discount_value=Decimal("5"),
        active=False,
    )
    db_session.add(coupon)
    db_session.commit()
    db_session.refresh(coupon)
    return coupon


@pytest.fixture()
def exhausted_coupon(db_session: Session) -> Coupon:
    """A coupon that has reached its max uses."""
    coupon = Coupon(
        code="MAXUSE15",
        discount_type="percent",
        discount_value=Decimal("15"),
        max_uses=5,
        uses_count=5,
        active=True,
    )
    db_session.add(coupon)
    db_session.commit()
    db_session.refresh(coupon)
    return coupon
