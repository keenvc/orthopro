-- CreateEnum for clinic data
CREATE TYPE "note_type" AS ENUM ('medical_soap', 'therapy_soap', 'kap', 'psychotherapy', 'evaluation', 'im_ketamine', 'simple', 'memo');
CREATE TYPE "survey_type" AS ENUM ('phq9', 'gad7', 'ybocs', 'mood_score', 'unknown');
CREATE TYPE "severity_level" AS ENUM ('minimal', 'mild', 'moderate', 'moderately_severe', 'severe', 'very_severe');

-- CreateTable square_transactions
CREATE TABLE "square_transactions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "patient_id" UUID NOT NULL,
    "square_id" TEXT UNIQUE,
    "order_id" TEXT,
    "amount_cents" INTEGER NOT NULL,
    "tip_amount_cents" INTEGER NOT NULL DEFAULT 0,
    "total_cents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" TEXT,
    "payment_method" TEXT,
    "receipt_url" TEXT,
    "transaction_date" TIMESTAMPTZ NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "square_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable clinical_notes
CREATE TABLE "clinical_notes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "patient_id" UUID NOT NULL,
    "clinic_id" TEXT NOT NULL DEFAULT 'centered-one',
    "note_type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "note_date" DATE NOT NULL,
    "cpt_codes" TEXT[],
    "is_signed" BOOLEAN NOT NULL DEFAULT false,
    "source_system" TEXT DEFAULT 'centered-osmind',
    "sync_status" TEXT DEFAULT 'synced',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clinical_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable patient_surveys
CREATE TABLE "patient_surveys" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "patient_id" UUID NOT NULL,
    "clinic_id" TEXT NOT NULL DEFAULT 'centered-one',
    "survey_type" TEXT NOT NULL,
    "survey_name" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "max_score" INTEGER,
    "severity_level" TEXT,
    "completed_date" TIMESTAMPTZ NOT NULL,
    "source_system" TEXT DEFAULT 'centered-osmind',
    "sync_status" TEXT DEFAULT 'synced',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "patient_surveys_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "square_transactions_patient_id_idx" ON "square_transactions"("patient_id");
CREATE INDEX "square_transactions_square_id_idx" ON "square_transactions"("square_id");
CREATE INDEX "square_transactions_transaction_date_idx" ON "square_transactions"("transaction_date");
CREATE INDEX "square_transactions_status_idx" ON "square_transactions"("status");

-- CreateIndex
CREATE INDEX "clinical_notes_patient_id_idx" ON "clinical_notes"("patient_id");
CREATE INDEX "clinical_notes_clinic_id_idx" ON "clinical_notes"("clinic_id");
CREATE INDEX "clinical_notes_note_date_idx" ON "clinical_notes"("note_date");
CREATE INDEX "clinical_notes_note_type_idx" ON "clinical_notes"("note_type");

-- CreateIndex
CREATE INDEX "patient_surveys_patient_id_idx" ON "patient_surveys"("patient_id");
CREATE INDEX "patient_surveys_clinic_id_idx" ON "patient_surveys"("clinic_id");
CREATE INDEX "patient_surveys_completed_date_idx" ON "patient_surveys"("completed_date");
CREATE INDEX "patient_surveys_survey_type_idx" ON "patient_surveys"("survey_type");
CREATE INDEX "patient_surveys_severity_level_idx" ON "patient_surveys"("severity_level");

-- AddForeignKey
ALTER TABLE "square_transactions" ADD CONSTRAINT "square_transactions_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clinical_notes" ADD CONSTRAINT "clinical_notes_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_surveys" ADD CONSTRAINT "patient_surveys_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;
