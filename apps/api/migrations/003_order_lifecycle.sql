-- 003_order_lifecycle.sql
-- Adds the shipment-status sync columns to the production `orders` table to
-- match the current SQLModel definition (apps/api/app/models/order.py).
--
-- Background: the FastAPI layer uses SQLModel.metadata.create_all(), which only
-- CREATEs missing tables and never ALTERs existing ones. New columns on the
-- existing `orders` table must be applied by hand. Both columns are nullable so
-- no backfill is needed.
--
-- Every statement is guarded with IF NOT EXISTS so the script is safe to re-run
-- and safe against a fresh database.

BEGIN;

-- Latest raw Shiprocket status text (e.g. "IN TRANSIT", "DELIVERED").
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipment_status varchar;

-- When the latest Shiprocket status update was received.
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipment_status_at timestamp;

COMMIT;
