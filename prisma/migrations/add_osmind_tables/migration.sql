-- CreateTable osmind_patients
CREATE TABLE "osmind_patients" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "osmind_id" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "date_of_birth" DATE,
    "email" TEXT,
    "phone" TEXT,
    "raw_data" JSONB,
    "synced_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_updated" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "osmind_patients_pkey" PRIMARY KEY ("id")
);

-- CreateTable osmind_appointments
CREATE TABLE "osmind_appointments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "osmind_id" TEXT NOT NULL,
    "patient_id" UUID NOT NULL,
    "appointment_date" TIMESTAMPTZ NOT NULL,
    "appointment_time" TEXT,
    "provider_id" TEXT,
    "provider_name" TEXT,
    "room_id" TEXT,
    "room_name" TEXT,
    "status" TEXT,
    "notes" TEXT,
    "raw_data" JSONB,
    "synced_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_updated" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "osmind_appointments_pkey" PRIMARY KEY ("id")
);

-- CreateTable osmind_insurance_cards
CREATE TABLE "osmind_insurance_cards" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "osmind_id" TEXT NOT NULL,
    "patient_id" UUID NOT NULL,
    "name" TEXT,
    "member_id" TEXT,
    "group_number" TEXT,
    "plan_name" TEXT,
    "carrier_name" TEXT,
    "image_url" TEXT,
    "raw_data" JSONB,
    "synced_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_updated" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "osmind_insurance_cards_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "osmind_patients_osmind_id_key" ON "osmind_patients"("osmind_id");

-- CreateIndex
CREATE INDEX "osmind_patients_osmind_id_idx" ON "osmind_patients"("osmind_id");

-- CreateIndex
CREATE INDEX "osmind_patients_first_name_last_name_idx" ON "osmind_patients"("first_name", "last_name");

-- CreateIndex
CREATE INDEX "osmind_patients_email_idx" ON "osmind_patients"("email");

-- CreateIndex
CREATE INDEX "osmind_patients_synced_at_idx" ON "osmind_patients"("synced_at");

-- CreateIndex
CREATE UNIQUE INDEX "osmind_appointments_osmind_id_key" ON "osmind_appointments"("osmind_id");

-- CreateIndex
CREATE INDEX "osmind_appointments_patient_id_idx" ON "osmind_appointments"("patient_id");

-- CreateIndex
CREATE INDEX "osmind_appointments_osmind_id_idx" ON "osmind_appointments"("osmind_id");

-- CreateIndex
CREATE INDEX "osmind_appointments_appointment_date_idx" ON "osmind_appointments"("appointment_date");

-- CreateIndex
CREATE INDEX "osmind_appointments_provider_id_idx" ON "osmind_appointments"("provider_id");

-- CreateIndex
CREATE INDEX "osmind_appointments_room_id_idx" ON "osmind_appointments"("room_id");

-- CreateIndex
CREATE INDEX "osmind_appointments_status_idx" ON "osmind_appointments"("status");

-- CreateIndex
CREATE UNIQUE INDEX "osmind_insurance_cards_osmind_id_key" ON "osmind_insurance_cards"("osmind_id");

-- CreateIndex
CREATE INDEX "osmind_insurance_cards_patient_id_idx" ON "osmind_insurance_cards"("patient_id");

-- CreateIndex
CREATE INDEX "osmind_insurance_cards_osmind_id_idx" ON "osmind_insurance_cards"("osmind_id");

-- CreateIndex
CREATE INDEX "osmind_insurance_cards_member_id_idx" ON "osmind_insurance_cards"("member_id");

-- CreateIndex
CREATE INDEX "osmind_insurance_cards_synced_at_idx" ON "osmind_insurance_cards"("synced_at");

-- AddForeignKey
ALTER TABLE "osmind_appointments" ADD CONSTRAINT "osmind_appointments_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "osmind_patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "osmind_insurance_cards" ADD CONSTRAINT "osmind_insurance_cards_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "osmind_patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;
