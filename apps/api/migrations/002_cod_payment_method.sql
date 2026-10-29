-- 002_cod_payment_method.sql
-- Adds the `payment_method` column to the production `orders` table to support
-- Cash on Delivery (COD) orders alongside the existing online (PhonePe) path.
--
-- Background: the FastAPI layer uses SQLModel.metadata.create_all(), which only
-- CREATEs missing tables and never ALTERs existing ones. Any new column on an
-- existing model must be applied by hand. Matches the Order SQLModel
-- (apps/api/app/models/order.py) field `payment_method: str = "online"`.
--
-- Idempotent: guarded with IF NOT EXISTS and a NULL backfill, safe to re-run.

BEGIN;

-- Add the payment method discriminator: "online" (PhonePe) | "cod".
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method varchar DEFAULT 'online';

-- Backfill any pre-existing rows (all historical orders were online/PhonePe).
UPDATE orders SET payment_method = 'online' WHERE payment_method IS NULL;

COMMIT;
