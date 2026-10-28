-- 001_phonepe_orders.sql
-- Reconciles the production `orders` and `payments` tables with the current
-- PhonePe-era SQLModel definitions (apps/api/app/models/order.py).
--
-- Background: the FastAPI layer uses SQLModel.metadata.create_all(), which only
-- CREATEs missing tables and never ALTERs existing ones. The live tables were
-- created in the Stripe era, so the PhonePe columns never reached production.
-- This script applies the drift by hand.
--
-- Every statement is guarded with IF EXISTS / IF NOT EXISTS so the script is
-- safe to re-run and safe against a fresh database.

BEGIN;

-- ---------------------------------------------------------------------------
-- orders
-- ---------------------------------------------------------------------------

-- Add the PhonePe merchant order id (the "ELW..." id we generate).
ALTER TABLE orders ADD COLUMN IF NOT EXISTS phonepe_order_id varchar;

-- Add PhonePe's internal order id (OMO...).
ALTER TABLE orders ADD COLUMN IF NOT EXISTS phonepe_internal_id varchar;

-- Unique index to match the model's `unique=True, index=True`.
-- A nullable unique index permits multiple NULLs in Postgres, so legacy rows
-- without a phonepe_order_id do not conflict.
CREATE UNIQUE INDEX IF NOT EXISTS ix_orders_phonepe_order_id
    ON orders (phonepe_order_id);

-- Relax the legacy Stripe column so PhonePe orders (which have no Stripe
-- session) can be inserted. Only runs if the column still exists.
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'orders' AND column_name = 'stripe_session_id'
    ) THEN
        ALTER TABLE orders ALTER COLUMN stripe_session_id DROP NOT NULL;
    END IF;
END $$;

-- Drop the legacy UNIQUE constraint on stripe_session_id if present.
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_stripe_session_id_key;

-- ---------------------------------------------------------------------------
-- payments
-- ---------------------------------------------------------------------------

-- Add the PhonePe payment id.
ALTER TABLE payments ADD COLUMN IF NOT EXISTS phonepe_payment_id varchar;

-- Relax the legacy Stripe payment column so PhonePe payments can be inserted.
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'payments' AND column_name = 'stripe_payment_id'
    ) THEN
        ALTER TABLE payments ALTER COLUMN stripe_payment_id DROP NOT NULL;
    END IF;
END $$;

-- Drop the legacy UNIQUE constraint on stripe_payment_id if present.
ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_stripe_payment_id_key;

COMMIT;
