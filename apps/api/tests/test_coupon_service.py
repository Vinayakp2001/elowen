"""
Tests for coupon_service.validate_coupon.

Validates coupon code lookup, active/expiry/max-uses checks, and
discount calculation for both percent and fixed discount types.
"""

from decimal import Decimal

from app.services.coupon_service import validate_coupon


# ---------------------------------------------------------------------------
# Percent discount tests
# ---------------------------------------------------------------------------

def test_valid_percent_coupon(db_session, percent_coupon):
    """10% off 1000 → new_total=900."""
    result = validate_coupon("WELCOME10", Decimal("1000"), db_session)

    assert result.valid is True
    assert result.discount_type == "percent"
    assert result.discount_value == Decimal("10")
    assert result.new_total == Decimal("900")


def test_percent_coupon_lowercase_code(db_session, percent_coupon):
    """Coupon code lookup is case-insensitive (uppercased internally)."""
    result = validate_coupon("welcome10", Decimal("500"), db_session)

    assert result.valid is True
    assert result.new_total == Decimal("450")  # 10% off 500


# ---------------------------------------------------------------------------
# Fixed discount tests
# ---------------------------------------------------------------------------

def test_valid_fixed_coupon(db_session, fixed_coupon):
    """$50 off 200 → new_total=150."""
    result = validate_coupon("FLAT50", Decimal("200"), db_session)

    assert result.valid is True
    assert result.discount_type == "fixed"
    assert result.discount_value == Decimal("50")
    assert result.new_total == Decimal("150")


def test_fixed_discount_exceeds_subtotal(db_session, fixed_coupon):
    """$50 off $30 → new_total=0 (clamped, not negative)."""
    result = validate_coupon("FLAT50", Decimal("30"), db_session)

    assert result.valid is True
    assert result.new_total == Decimal("0")


# ---------------------------------------------------------------------------
# Failure cases
# ---------------------------------------------------------------------------

def test_coupon_not_found(db_session):
    """Non-existent coupon code → invalid with 'not found' message."""
    result = validate_coupon("NOPE999", Decimal("1000"), db_session)

    assert result.valid is False
    assert "not found" in result.message.lower()


def test_inactive_coupon(db_session, inactive_coupon):
    """Coupon with active=False → invalid with 'no longer active' message."""
    result = validate_coupon("INACTIVE5", Decimal("100"), db_session)

    assert result.valid is False
    assert "no longer active" in result.message.lower()


def test_expired_coupon(db_session, expired_coupon):
    """Coupon past expires_at → invalid with 'expired' message."""
    result = validate_coupon("EXPIRED20", Decimal("100"), db_session)

    assert result.valid is False
    assert "expired" in result.message.lower()


def test_coupon_at_max_uses(db_session, exhausted_coupon):
    """Coupon with uses_count >= max_uses → invalid with 'usage limit' message."""
    result = validate_coupon("MAXUSE15", Decimal("100"), db_session)

    assert result.valid is False
    assert "usage limit" in result.message.lower()
