/**
 * Osmind Sync Service
 * Syncs patients, appointments, and insurance cards from Osmind to database
 */

import { osmindClient, type PatientData, type AppointmentData, type InsuranceCardData } from './client';
import { prisma } from '../database';

interface SyncResult {
  success: boolean;
  synced: number;
  updated: number;
  errors: string[];
  timestamp: string;
}

/**
 * Sync patients from Osmind to database
 */
export async function syncPatients(
  startDate?: string,
  endDate?: string
): Promise<SyncResult> {
  const result: SyncResult = {
    success: false,
    synced: 0,
    updated: 0,
    errors: [],
    timestamp: new Date().toISOString(),
  };

  try {
    console.log('🔄 Starting Osmind patient sync...');

    // Fetch appointments to get unique patients
    const appointments = await osmindClient.getAppointments(startDate, endDate);
    const uniquePatientIds = new Set(appointments.map((apt: any) => apt.patient_id));

    console.log(`📊 Found ${uniquePatientIds.size} unique patients from appointments`);

    for (const patientId of Array.from(uniquePatientIds)) {
      try {
        const patientData = await osmindClient.getPatientById(patientId);

        if (!patientData || !patientData.id) {
          result.errors.push(`Invalid patient data for ${patientId}`);
          continue;
        }

        // Check if patient exists
        const existingPatient = await prisma.osmind_patients.findUnique({
          where: { osmind_id: patientData.id },
        });

        if (existingPatient) {
          // Update existing patient
          await prisma.osmind_patients.update({
            where: { osmind_id: patientData.id },
            data: {
              first_name: patientData.first_name || '',
              last_name: patientData.last_name || '',
              date_of_birth: patientData.date_of_birth ? new Date(patientData.date_of_birth) : null,
              email: patientData.email,
              phone: patientData.phone,
              raw_data: patientData,
              synced_at: new Date(),
            },
          });
          result.updated++;
        } else {
          // Create new patient
          await prisma.osmind_patients.create({
            data: {
              osmind_id: patientData.id,
              first_name: patientData.first_name || '',
              last_name: patientData.last_name || '',
              date_of_birth: patientData.date_of_birth ? new Date(patientData.date_of_birth) : null,
              email: patientData.email,
              phone: patientData.phone,
              raw_data: patientData,
            },
          });
          result.synced++;
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        result.errors.push(`Error syncing patient ${patientId}: ${errorMsg}`);
        console.error(`❌ Error syncing patient ${patientId}:`, error);
      }
    }

    result.success = true;
    console.log(`✅ Patient sync complete: ${result.synced} new, ${result.updated} updated`);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    result.errors.push(`Patient sync failed: ${errorMsg}`);
    console.error('❌ Patient sync failed:', error);
  }

  return result;
}

/**
 * Sync appointments from Osmind to database
 */
export async function syncAppointments(
  startDate?: string,
  endDate?: string
): Promise<SyncResult> {
  const result: SyncResult = {
    success: false,
    synced: 0,
    updated: 0,
    errors: [],
    timestamp: new Date().toISOString(),
  };

  try {
    console.log('🔄 Starting Osmind appointment sync...');

    const appointments = await osmindClient.getAppointments(startDate, endDate);
    console.log(`📊 Found ${appointments.length} appointments to sync`);

    for (const appointmentData of appointments) {
      try {
        if (!appointmentData.id || !appointmentData.patient_id) {
          result.errors.push(`Invalid appointment data: missing id or patient_id`);
          continue;
        }

        // Ensure patient exists in our database
        const patient = await prisma.osmind_patients.findUnique({
          where: { osmind_id: appointmentData.patient_id },
        });

        if (!patient) {
          // Try to fetch and create the patient first
          try {
            const patientData = await osmindClient.getPatientById(appointmentData.patient_id);
            await prisma.osmind_patients.create({
              data: {
                osmind_id: patientData.id,
                first_name: patientData.first_name || '',
                last_name: patientData.last_name || '',
                date_of_birth: patientData.date_of_birth ? new Date(patientData.date_of_birth) : null,
                email: patientData.email,
                phone: patientData.phone,
                raw_data: patientData,
              },
            });
          } catch (e) {
            result.errors.push(`Could not create patient ${appointmentData.patient_id}`);
            continue;
          }
        }

        // Check if appointment exists
        const existingAppointment = await prisma.osmind_appointments.findUnique({
          where: { osmind_id: appointmentData.id },
        });

        if (existingAppointment) {
          // Update existing appointment
          await prisma.osmind_appointments.update({
            where: { osmind_id: appointmentData.id },
            data: {
              appointment_date: new Date(appointmentData.date),
              appointment_time: appointmentData.time,
              provider_id: appointmentData.provider_id,
              room_id: appointmentData.room_id,
              status: appointmentData.status,
              raw_data: appointmentData,
              synced_at: new Date(),
            },
          });
          result.updated++;
        } else {
          // Create new appointment
          const newPatient = await prisma.osmind_patients.findUnique({
            where: { osmind_id: appointmentData.patient_id },
          });

          if (newPatient) {
            await prisma.osmind_appointments.create({
              data: {
                osmind_id: appointmentData.id,
                patient_id: newPatient.id,
                appointment_date: new Date(appointmentData.date),
                appointment_time: appointmentData.time,
                provider_id: appointmentData.provider_id,
                room_id: appointmentData.room_id,
                status: appointmentData.status,
                raw_data: appointmentData,
              },
            });
            result.synced++;
          }
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        result.errors.push(`Error syncing appointment ${appointmentData.id}: ${errorMsg}`);
        console.error(`❌ Error syncing appointment ${appointmentData.id}:`, error);
      }
    }

    result.success = true;
    console.log(`✅ Appointment sync complete: ${result.synced} new, ${result.updated} updated`);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    result.errors.push(`Appointment sync failed: ${errorMsg}`);
    console.error('❌ Appointment sync failed:', error);
  }

  return result;
}

/**
 * Sync insurance cards for patients from Osmind to database
 */
export async function syncInsuranceCards(): Promise<SyncResult> {
  const result: SyncResult = {
    success: false,
    synced: 0,
    updated: 0,
    errors: [],
    timestamp: new Date().toISOString(),
  };

  try {
    console.log('🔄 Starting Osmind insurance cards sync...');

    // Get all patients from our database
    const patients = await prisma.osmind_patients.findMany({
      select: { id: true, osmind_id: true },
    });

    console.log(`📊 Syncing insurance cards for ${patients.length} patients`);

    for (const patient of patients) {
      try {
        const insuranceCards = await osmindClient.getInsuranceCards(patient.osmind_id);

        for (const cardData of insuranceCards) {
          if (!cardData.id) {
            continue;
          }

          const existingCard = await prisma.osmind_insurance_cards.findUnique({
            where: { osmind_id: cardData.id },
          });

          if (existingCard) {
            // Update existing card
            await prisma.osmind_insurance_cards.update({
              where: { osmind_id: cardData.id },
              data: {
                name: cardData.name,
                member_id: cardData.member_id,
                group_number: cardData.group_number,
                raw_data: cardData,
                synced_at: new Date(),
              },
            });
            result.updated++;
          } else {
            // Create new card
            await prisma.osmind_insurance_cards.create({
              data: {
                osmind_id: cardData.id,
                patient_id: patient.id,
                name: cardData.name,
                member_id: cardData.member_id,
                group_number: cardData.group_number,
                raw_data: cardData,
              },
            });
            result.synced++;
          }
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        result.errors.push(`Error syncing insurance cards for patient ${patient.osmind_id}: ${errorMsg}`);
        console.error(`❌ Error syncing insurance cards for patient ${patient.osmind_id}:`, error);
      }
    }

    result.success = true;
    console.log(`✅ Insurance cards sync complete: ${result.synced} new, ${result.updated} updated`);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    result.errors.push(`Insurance cards sync failed: ${errorMsg}`);
    console.error('❌ Insurance cards sync failed:', error);
  }

  return result;
}

/**
 * Run complete Osmind sync (patients, appointments, insurance cards)
 */
export async function runCompleteSyncxmd(
  startDate?: string,
  endDate?: string
): Promise<{
  patients: SyncResult;
  appointments: SyncResult;
  insuranceCards: SyncResult;
  timestamp: string;
}> {
  console.log('🚀 Starting complete Osmind sync...');
  console.log(`📅 Date range: ${startDate || 'default'} to ${endDate || 'default'}`);

  const [patientResults, appointmentResults, insuranceResults] = await Promise.all([
    syncPatients(startDate, endDate),
    syncAppointments(startDate, endDate),
    syncInsuranceCards(),
  ]);

  const summary = {
    patients: patientResults,
    appointments: appointmentResults,
    insuranceCards: insuranceResults,
    timestamp: new Date().toISOString(),
  };

  console.log('\n📊 SYNC SUMMARY:');
  console.log(`Patients: ${patientResults.synced} new, ${patientResults.updated} updated`);
  console.log(`Appointments: ${appointmentResults.synced} new, ${appointmentResults.updated} updated`);
  console.log(`Insurance Cards: ${insuranceResults.synced} new, ${insuranceResults.updated} updated`);

  return summary;
}

export type { SyncResult };
