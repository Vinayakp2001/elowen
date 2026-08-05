"""
Cart validation service.

Validates stock and pricing against the Payload CMS SQLite database.
Payload stores products in a SQLite file at apps/web/payload.db.
We read it directly via sqlite3 — no HTTP call needed since both
services run locally. In production, replace with an internal API call
to the Next.js /api/products-by-skus route if needed.
"""

import json
import logging
import os
import sqlite3
from typing import List

from app.schemas.cart import CartItemInput, CartItemResult, CartValidateResponse

logger = logging.getLogger(__name__)

# Path to Payload's SQLite DB — relative to where uvicorn runs (apps/api/)
PAYLOAD_DB_PATH = os.getenv(
    "PAYLOAD_DB_PATH",
    os.path.join(os.path.dirname(__file__), "../../../web/payload.db"),
)


def _get_product_by_sku(sku: str) -> dict | None:
    """Query Payload's SQLite DB for a product by SKU."""
    try:
        db_path = os.path.abspath(PAYLOAD_DB_PATH)
        if not os.path.exists(db_path):
            logger.warning("[CartService] payload.db not found at %s", db_path)
            return None

        conn = sqlite3.connect(db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute(
            "SELECT id, title, sku, price, in_stock FROM products WHERE sku = ? LIMIT 1",
            (sku,),
        )
        row = cursor.fetchone()
        conn.close()

        if row:
            return {
                "id": row["id"],
                "title": row["title"],
                "sku": row["sku"],
                "price": float(row["price"]),
                "in_stock": bool(row["in_stock"]),
            }
        return None
    except Exception as e:
        logger.error("[CartService] SQLite error for sku=%s: %s", sku, str(e))
        return None


async def validate_cart(items: List[CartItemInput]) -> CartValidateResponse:
    results = []
    all_valid = True

    for item in items:
        product = _get_product_by_sku(item.sku)

        if product is None:
            # Product not found in Payload — treat as unavailable
            logger.warning("[CartService] SKU not found: %s", item.sku)
            results.append(
                CartItemResult(
                    sku=item.sku,
                    available=False,
                    current_price=item.unit_price,
                    price_changed=False,
                )
            )
            all_valid = False
            continue

        available = product["in_stock"]
        current_price = product["price"]
        price_changed = abs(current_price - float(item.unit_price)) > 0.01

        if not available:
            all_valid = False

        results.append(
            CartItemResult(
                sku=item.sku,
                available=available,
                current_price=current_price,
                price_changed=price_changed,
            )
        )

    return CartValidateResponse(valid=all_valid, items=results)
