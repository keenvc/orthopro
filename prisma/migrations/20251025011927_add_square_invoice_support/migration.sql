-- Migration: Add Square Invoice Support
-- Date: 2025-10-25
-- Description: Extend invoices, patients, and payments tables for multi-processor support

-- ============================================
-- 1. Extend patients table
-- ============================================
ALTER TABLE "patients" ADD COLUMN IF NOT EXISTS "square_customer_id" TEXT;
ALTER TABLE "patients" ADD COLUMN IF NOT EXISTS "external_ids" JSONB;

CREATE INDEX IF NOT EXISTS "patients_square_customer_id_idx" ON "patients"("square_customer_id");

-- ============================================
-- 2. Extend invoices table
-- ============================================
ALTER TABLE "invoices" ADD COLUMN IF NOT EXISTS "processor" TEXT NOT NULL DEFAULT 'inbox_health';
ALTER TABLE "invoices" ADD COLUMN IF NOT EXISTS "processor_invoice_id" TEXT;
ALTER TABLE "invoices" ADD COLUMN IF NOT EXISTS "processor_metadata" JSONB;
ALTER TABLE "invoices" ADD COLUMN IF NOT EXISTS "invoice_title" TEXT;
ALTER TABLE "invoices" ADD COLUMN IF NOT EXISTS "invoice_date" DATE;
ALTER TABLE "invoices" ADD COLUMN IF NOT EXISTS "last_payment_date" DATE;
ALTER TABLE "invoices" ADD COLUMN IF NOT EXISTS "time_zone" TEXT;
ALTER TABLE "invoices" ADD COLUMN IF NOT EXISTS "delivery_method" TEXT;
ALTER TABLE "invoices" ADD COLUMN IF NOT EXISTS "recurring_series_id" TEXT;
ALTER TABLE "invoices" ADD COLUMN IF NOT EXISTS "installments_count" INTEGER;
ALTER TABLE "invoices" ADD COLUMN IF NOT EXISTS "tip_amount_cents" INTEGER DEFAULT 0;
ALTER TABLE "invoices" ADD COLUMN IF NOT EXISTS "auto_payment_source" TEXT;

CREATE INDEX IF NOT EXISTS "invoices_processor_idx" ON "invoices"("processor");
CREATE INDEX IF NOT EXISTS "invoices_processor_invoice_id_idx" ON "invoices"("processor_invoice_id");
CREATE INDEX IF NOT EXISTS "invoices_status_idx" ON "invoices"("status");
CREATE INDEX IF NOT EXISTS "invoices_due_date_idx" ON "invoices"("due_date");

-- Create unique constraint for processor + processor_invoice_id combination
-- First, handle any existing duplicates (should be none, but safety first)
DO $$ 
BEGIN
    -- Only create the unique constraint if it doesn't already exist
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'invoices_processor_processor_invoice_id_key'
    ) THEN
        ALTER TABLE "invoices" ADD CONSTRAINT "invoices_processor_processor_invoice_id_key" 
        UNIQUE("processor", "processor_invoice_id");
    END IF;
END $$;

-- ============================================
-- 3. Extend payments table
-- ============================================
ALTER TABLE "payments" ADD COLUMN IF NOT EXISTS "processor" TEXT DEFAULT 'inbox_health';
ALTER TABLE "payments" ADD COLUMN IF NOT EXISTS "processor_payment_id" TEXT;
ALTER TABLE "payments" ADD COLUMN IF NOT EXISTS "tip_amount_cents" INTEGER DEFAULT 0;

CREATE INDEX IF NOT EXISTS "payments_processor_idx" ON "payments"("processor");

-- ============================================
-- 4. Comments for documentation
-- ============================================
COMMENT ON COLUMN "patients"."square_customer_id" IS 'Square customer ID for Square invoices';
COMMENT ON COLUMN "patients"."external_ids" IS 'JSON object storing external IDs from various processors';

COMMENT ON COLUMN "invoices"."processor" IS 'Payment processor: inbox_health, square, stripe, etc.';
COMMENT ON COLUMN "invoices"."processor_invoice_id" IS 'External invoice ID from the processor (e.g., Square Invoice Token)';
COMMENT ON COLUMN "invoices"."invoice_title" IS 'Human-readable description of the invoice';
COMMENT ON COLUMN "invoices"."invoice_date" IS 'Date when the invoice was created (may differ from date_of_service)';
COMMENT ON COLUMN "invoices"."last_payment_date" IS 'Date of the most recent payment on this invoice';
COMMENT ON COLUMN "invoices"."recurring_series_id" IS 'ID linking recurring invoices together';
COMMENT ON COLUMN "invoices"."auto_payment_source" IS 'Automatic payment method: card_on_file, bank_account, none';

COMMENT ON COLUMN "payments"."processor" IS 'Payment processor that handled this payment';
COMMENT ON COLUMN "payments"."processor_payment_id" IS 'External payment ID from the processor';
