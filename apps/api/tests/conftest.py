"""Shared pytest fixtures for API integration tests.

Uses an in-memory SQLite database so tests need no external Postgres and run
fast in CI. Only the FastAPI `orders`/`checkout` tables are created — the
Payload-owned tables are not needed for these flows.
"""
import os

# Settings require these before `app.config` imports. Set dummy values so the
# Settings() singleton constructs without a real .env in CI.
os.environ.setdefault("DATABASE_URL", "sqlite://")
os.environ.setdefault("PHONEPE_CLIENT_ID", "TEST")
os.environ.setdefault("PHONEPE_CLIENT_SECRET", "TEST")

# Stop pydantic Settings from loading a developer's real .env (which may carry
# extra vars like stripe_* that the Settings model forbids) and from rejecting
# unknown vars. Tests must run against controlled env only, not the live .env.
# This patches the BaseSettings model_config BEFORE app.config is imported.
from pydantic_settings import BaseSettings
BaseSettings.model_config["env_file"] = None
BaseSettings.model_config["extra"] = "ignore"

import tempfile
import pytest
from sqlmodel import SQLModel, Session, create_engine
from sqlalchemy.ext.compiler import compiles
from sqlalchemy.dialects.postgresql import JSONB

# Models use Postgres JSONB (prod). SQLite has no JSONB — render it as plain
# JSON for the in-memory test DB so create_all works. Prod behaviour unchanged.
@compiles(JSONB, "sqlite")
def _compile_jsonb_sqlite(element, compiler, **kw):
    return "JSON"

# Import models so they register on SQLModel.metadata before create_all.
from app.models.order import Order, OrderItem, Payment  # noqa: F401
from app.models.webhook import WebhookEvent  # noqa: F401


@pytest.fixture()
def test_engine():
    """A fresh file-based SQLite engine per test.

    File-based (not in-memory) so the background fulfilment thread — which opens
    its OWN connection via a separate Session — sees the same data. In-memory
    SQLite gives each connection an isolated empty DB, which hid the `orders`
    table from the thread.
    """
    fd, path = tempfile.mkstemp(suffix=".db")
    os.close(fd)
    engine = create_engine(
        f"sqlite:///{path}",
        connect_args={"check_same_thread": False},
    )
    SQLModel.metadata.create_all(engine)
    yield engine
    engine.dispose()
    os.remove(path)


@pytest.fixture()
def session(test_engine):
    """A session bound to the per-test file-based SQLite engine."""
    with Session(test_engine) as s:
        yield s
