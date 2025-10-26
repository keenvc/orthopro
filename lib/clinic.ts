import { supabase } from './supabase';

// CLINICAL NOTES
export async function getClinicalNotes(patientId?: string) {
  let query = supabase
    .from('clinical_notes')
    .select('*')
    .order('note_date', { ascending: false });

  if (patientId) {
    query = query.eq('patient_id', patientId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getClinicalNotesByClinic(clinicId: string = 'centered-one') {
  const { data, error } = await supabase
    .from('clinical_notes')
    .select(`
      *,
      patients (id, first_name, last_name, email)
    `)
    .eq('clinic_id', clinicId)
    .order('note_date', { ascending: false })
    .limit(100);

  if (error) throw error;
  return data;
}

// PATIENT SURVEYS
export async function getPatientSurveys(patientId?: string) {
  let query = supabase
    .from('patient_surveys')
    .select('*')
    .order('completed_date', { ascending: false });

  if (patientId) {
    query = query.eq('patient_id', patientId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getPatientSurveysByClinic(clinicId: string = 'centered-one') {
  const { data, error } = await supabase
    .from('patient_surveys')
    .select(`
      *,
      patients (id, first_name, last_name, email)
    `)
    .eq('clinic_id', clinicId)
    .order('completed_date', { ascending: false })
    .limit(100);

  if (error) throw error;
  return data;
}

export async function getHighRiskPatients(clinicId: string = 'centered-one') {
  const { data, error } = await supabase.rpc('get_high_risk_patients', {
    p_clinic_id: clinicId
  });

  if (error) throw error;
  return data;
}

// APPOINTMENTS
export async function getAppointments(patientId?: string) {
  let query = supabase
    .from('appointments')
    .select(`
      *,
      patients (id, first_name, last_name),
      doctors (first_name, last_name)
    `)
    .order('appointment_date', { ascending: false });

  if (patientId) {
    query = query.eq('patient_id', patientId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getUpcomingAppointments(clinicId: string = 'centered-one') {
  const { data, error } = await supabase
    .from('appointments')
    .select(`
      *,
      patients (id, first_name, last_name, email, cell_phone),
      doctors (first_name, last_name)
    `)
    .eq('clinic_id', clinicId)
    .in('status', ['scheduled', 'confirmed'])
    .gte('appointment_date', new Date().toISOString())
    .order('appointment_date', { ascending: true })
    .limit(50);

  if (error) throw error;
  return data;
}

export async function getAppointmentStats(clinicId: string = 'centered-one') {
  const { data: allAppt } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true })
    .eq('clinic_id', clinicId);

  const { data: noShowAppt } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true })
    .eq('clinic_id', clinicId)
    .eq('no_show', true);

  const { data: cancelledAppt } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true })
    .eq('clinic_id', clinicId)
    .eq('cancelled', true);

  return {
    total: allAppt?.length || 0,
    noShows: noShowAppt?.length || 0,
    cancelled: cancelledAppt?.length || 0
  };
}

// PATIENT LLM CONTEXT
export async function getPatientLLMContext(patientId: string) {
  const { data, error } = await supabase.rpc('get_patient_llm_context', {
    p_patient_id: patientId
  });

  if (error) throw error;
  return data?.[0];
}

// CLINIC DASHBOARD STATS
export async function getClinicDashboardStats() {
  const { data, error } = await supabase
    .from('mv_clinic_dashboard_stats')
    .select('*')
    .eq('clinic_id', 'centered-one')
    .single();

  if (error) throw error;
  return data;
}

// MENTAL HEALTH STATUS
export async function getPatientMentalHealthStatus(patientId: string) {
  const { data, error } = await supabase
    .from('v_patient_mental_health_status')
    .select('*')
    .eq('id', patientId)
    .single();

  if (error) throw error;
  return data;
}

export async function getMentalHealthStatusList(clinicId: string = 'centered-one') {
  const { data, error } = await supabase
    .from('v_patient_mental_health_status')
    .select('*')
    .eq('clinic_id', clinicId)
    .order('last_survey_date', { ascending: false })
    .limit(50);

  if (error) throw error;
  return data;
}

// SURVEY TRENDS
export async function getSurveyTrends(patientId: string, surveyType: string) {
  const { data, error } = await supabase
    .from('patient_surveys')
    .select('score, completed_date, severity_level')
    .eq('patient_id', patientId)
    .eq('survey_type', surveyType)
    .order('completed_date', { ascending: true })
    .limit(30);

  if (error) throw error;
  return data;
}

// CLINIC STATS
export async function getClinicNoteStats(clinicId: string = 'centered-one') {
  const { data, error } = await supabase
    .from('clinical_notes')
    .select('note_type', { count: 'exact' })
    .eq('clinic_id', clinicId)
    .group_by('note_type');

  if (error) throw error;
  return data;
}
