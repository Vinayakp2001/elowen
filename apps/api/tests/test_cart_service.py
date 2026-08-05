"""
Tests for cart_service.validate_cart.

Validates stock and pricing against the Payload CMS SQLite database.
The service reads products directly from payload.db via sqlite3.
"""

import asyncio
from decimal import Decimal
from unittest.mock import patch

import pytest

from app.schemas.cart import CartItemInput
from app.services import cart_service


# ---------------------------------------------------------------------------
# Helper
# ---------------------------------------------------------------------------

def _run(coro):
    """Run an async coroutine synchronously (avoids pytest-asyncio dependency)."""
    return asyncio.get_event_loop().run_until_complete(coro)


def _make_item(sku: str, price: str, quantity: int = 1) -> CartItemInput:
    return CartItemInput(
        sku=sku,
        variant_key=f"{sku}-default",
        quantity=quantity,
        unit_price=Decimal(price),
    )


# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------

def test_in_stock_item_with_correct_price(payload_db):
    """Item in stock with matching price → available, no price change."""
    with patch.object(cart_service, "PAYLOAD_DB_PATH", payload_db):
        result = _run(cart_service.validate_cart([_make_item("RING-001", "1250.00")]))

    assert result.valid is True
    assert len(result.items) == 1
    assert result.items[0].sku == "RING-001"
    assert result.items[0].available is True
    assert result.items[0].current_price == 1250.00
    assert result.items[0].price_changed is False


def test_out_of_stock_item(payload_db):
    """Item exists but in_stock=False → not available, cart invalid."""
    with patch.object(cart_service, "PAYLOAD_DB_PATH", payload_db):
        result = _run(cart_service.validate_cart([_make_item("NECK-001", "450.00")]))

    assert result.valid is False
    assert result.items[0].sku == "NECK-001"
    assert result.items[0].available is False
    assert result.items[0].current_price == 450.00


def test_product_not_found(payload_db):
    """SKU not in Payload DB → treated as unavailable, cart invalid."""
    with patch.object(cart_service, "PAYLOAD_DB_PATH", payload_db):
        result = _run(cart_service.validate_cart([_make_item("NOPE-999", "100.00")]))

    assert result.valid is False
    assert result.items[0].sku == "NOPE-999"
    assert result.items[0].available is False
    assert result.items[0].price_changed is False


def test_price_change_detected(payload_db):
    """Item in stock but submitted price differs from DB price → price_changed=True."""
    with patch.object(cart_service, "PAYLOAD_DB_PATH", payload_db):
        result = _run(cart_service.validate_cart([_make_item("RING-001", "999.00")]))

    # Price changed but item is still available — cart is still "valid"
    # (validation checks stock, not price mismatch per se)
    assert result.valid is True
    assert result.items[0].available is True
    assert result.items[0].price_changed is True
    assert result.items[0].current_price == 1250.00


def test_mixed_cart_valid_and_invalid(payload_db):
    """Cart with one valid, one out-of-stock, one missing → overall invalid."""
    items = [
        _make_item("RING-001", "1250.00"),   # valid, in stock
        _make_item("NECK-001", "450.00"),     # out of stock
        _make_item("NOPE-999", "50.00"),      # not found
    ]
    with patch.object(cart_service, "PAYLOAD_DB_PATH", payload_db):
        result = _run(cart_service.validate_cart(items))

    assert result.valid is False
    assert len(result.items) == 3

    assert result.items[0].available is True
    assert result.items[1].available is False
    assert result.items[2].available is False


def test_empty_cart_is_valid(payload_db):
    """An empty cart has no invalid items → valid=True."""
    with patch.object(cart_service, "PAYLOAD_DB_PATH", payload_db):
        result = _run(cart_service.validate_cart([]))

    assert result.valid is True
    assert len(result.items) == 0


def test_payload_db_missing_returns_unavailable():
    """If payload.db does not exist, all items are treated as unavailable."""
    # PAYLOAD_DB_PATH points to a nonexistent file (default unset)
    with patch.object(cart_service, "PAYLOAD_DB_PATH", "/nonexistent/path/payload.db"):
        result = _run(cart_service.validate_cart([_make_item("RING-001", "1250.00")]))

    assert result.valid is False
    assert result.items[0].available is False
