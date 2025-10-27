import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Lazy initialization - only create client when needed, not at module load time
let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient() {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase environment variables are not configured');
  }

  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  return supabaseInstance;
}

// For backward compatibility - deprecated, use getSupabaseClient() instead
export const supabase = {
  get from() {
    return getSupabaseClient().from;
  },
  get channel() {
    return getSupabaseClient().channel;
  }
} as any;

// Database helper functions
export async function getPatients() {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from('patients')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
}

export async function getPatientById(id: string) {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from('patients')
    .select(`
      *,
      invoices (*, line_items (*)),
      patient_plans (*)
    `)
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
}

export async function getInvoices() {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from('invoices')
    .select(`
      *,
      patients (id, first_name, last_name),
      practices (name),
      doctors (first_name, last_name)
    `)
    .order('date_of_service', { ascending: false });
  
  if (error) throw error;
  return data;
}

export async function getWebhookEvents() {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from('webhook_events')
    .select('*')
    .order('received_at', { ascending: false })
    .limit(50);
  
  if (error) throw error;
  return data;
}

export async function getPayments() {
  const client = getSupabaseClient();
  const { data, error } = await client
    .from('payments')
    .select(`
      *,
      patients (first_name, last_name),
      invoice_payments (*, invoices (*))
    `)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
}

export async function getDashboardStats() {
  const client = getSupabaseClient();
  const [patients, invoices, payments, webhooks] = await Promise.all([
    client.from('patients').select('id', { count: 'exact', head: true }),
    client.from('invoices').select('id', { count: 'exact', head: true }),
    client.from('payments').select('id', { count: 'exact', head: true }),
    client.from('webhook_events').select('id', { count: 'exact', head: true })
  ]);

  // Get total balance
  const { data: balanceData } = await client
    .from('patients')
    .select('balance_cents');
  
  const totalBalance = balanceData?.reduce((sum, p) => sum + (p.balance_cents || 0), 0) || 0;

  return {
    patientCount: patients.count || 0,
    invoiceCount: invoices.count || 0,
    paymentCount: payments.count || 0,
    webhookCount: webhooks.count || 0,
    totalBalanceCents: totalBalance
  };
}

// Real-time subscription helper
export function subscribeToWebhookEvents(callback: (payload: any) => void) {
  const client = getSupabaseClient();
  return client
    .channel('webhook_events')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'webhook_events'
    }, callback)
    .subscribe();
}
