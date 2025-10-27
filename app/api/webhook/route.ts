import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Prevent static generation - this route is dynamic only
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Create Supabase client with service role key for server-side operations
function getWebhookSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!url || !key) {
    throw new Error('Supabase webhook configuration missing');
  }
  
  return createClient(url, key);
}

// Log all webhook events to console and database
export async function POST(request: NextRequest) {
  try {
    const supabase = getWebhookSupabaseClient();
    const body = await request.json();
    const headers = Object.fromEntries(request.headers);
    
    console.log('=== WEBHOOK RECEIVED ===');
    console.log('Timestamp:', new Date().toISOString());
    console.log('Headers:', JSON.stringify(headers, null, 2));
    console.log('Body:', JSON.stringify(body, null, 2));
    console.log('========================\n');

    // Store webhook in database
    const { data: webhookRecord, error: webhookError } = await supabase
      .from('webhook_events')
      .insert({
        event_type: body.event_type || body.type || 'unknown',
        payload: body,
        headers: headers,
        received_at: new Date().toISOString(),
        processed: false,
      })
      .select()
      .single();

    if (webhookError) {
      console.error('Failed to store webhook:', webhookError);
    } else {
      console.log('Webhook stored with ID:', webhookRecord.id);
    }

    // Process different event types
    let processResult = null;
    
    try {
      const eventType = body.event_type || body.type;
      
      switch (eventType) {
        case 'patient_created':
        case 'patient_updated':
          processResult = await handlePatientEvent(body);
          break;
          
        case 'payment_created':
        case 'payment_updated':
          processResult = await handlePaymentEvent(body);
          break;
          
        case 'invoice_created':
        case 'invoice_updated':
          processResult = await handleInvoiceEvent(body);
          break;
          
        case 'invoice_payment_created':
        case 'invoice_payment_updated':
          processResult = await handleInvoicePaymentEvent(body);
          break;
          
        default:
          console.log(`Unhandled event type: ${eventType}`);
          processResult = { status: 'unhandled', eventType };
      }

      // Update webhook record as processed
      if (webhookRecord) {
        await supabase
          .from('webhook_events')
          .update({
            processed: true,
            processed_at: new Date().toISOString(),
            processing_result: processResult,
          })
          .eq('id', webhookRecord.id);
      }
    } catch (processingError: any) {
      console.error('Error processing webhook:', processingError);
      
      if (webhookRecord) {
        await supabase
          .from('webhook_events')
          .update({
            processed: false,
            processing_error: processingError.message,
          })
          .eq('id', webhookRecord.id);
      }
    }

    // Always return 200 to acknowledge receipt
    return NextResponse.json({
      success: true,
      message: 'Webhook received and processed',
      webhookId: webhookRecord?.id,
      eventType: body.event_type || body.type,
      processResult,
    });

  } catch (error: any) {
    console.error('Webhook processing error:', error);
    
    // Still return 200 to prevent retries
    return NextResponse.json({
      success: false,
      error: error.message,
      message: 'Webhook received but processing failed',
    });
  }
}

// Handle patient events
async function handlePatientEvent(body: any) {
  console.log('Processing patient event...');
  
  const patientData = body.data || body.patient || body;
  const patientId = patientData.id || patientData.patient_id;
  
  if (!patientId) {
    console.log('No patient ID found in webhook payload');
    return { status: 'skipped', reason: 'no_patient_id' };
  }

  // Check if patient exists in our database
  const { data: existingPatient } = await supabase
    .from('patients')
    .select('*')
    .eq('inbox_health_id', patientId)
    .single();

  if (existingPatient) {
    // Update existing patient
    const { error } = await supabase
      .from('patients')
      .update({
        first_name: patientData.first_name || existingPatient.first_name,
        last_name: patientData.last_name || existingPatient.last_name,
        email: patientData.email || existingPatient.email,
        cell_phone: patientData.cell_phone || existingPatient.cell_phone,
        date_of_birth: patientData.date_of_birth || existingPatient.date_of_birth,
        balance_cents: patientData.balance_cents || patientData.cached_balance_cents,
        sync_status: 'synced',
        last_synced_at: new Date().toISOString(),
      })
      .eq('id', existingPatient.id);

    if (error) {
      console.error('Failed to update patient:', error);
      return { status: 'error', error: error.message };
    }

    console.log(`Patient ${patientId} updated successfully`);
    return { status: 'updated', patientId, localId: existingPatient.id };
    
  } else {
    // Create new patient
    const { data, error } = await supabase
      .from('patients')
      .insert({
        inbox_health_id: patientId,
        first_name: patientData.first_name,
        last_name: patientData.last_name,
        email: patientData.email,
        cell_phone: patientData.cell_phone,
        date_of_birth: patientData.date_of_birth,
        address_line_1: patientData.address_line_1,
        address_line_2: patientData.address_line_2,
        city: patientData.city,
        state: patientData.state,
        zip: patientData.zip,
        balance_cents: patientData.balance_cents || patientData.cached_balance_cents,
        sync_status: 'synced',
        last_synced_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to create patient:', error);
      return { status: 'error', error: error.message };
    }

    console.log(`Patient ${patientId} created successfully`);
    return { status: 'created', patientId, localId: data.id };
  }
}

// Handle payment events
async function handlePaymentEvent(body: any) {
  console.log('Processing payment event...');
  
  const paymentData = body.data || body.payment || body;
  const paymentId = paymentData.id || paymentData.payment_id;
  
  if (!paymentId) {
    return { status: 'skipped', reason: 'no_payment_id' };
  }

  // Upsert payment
  const { data, error } = await supabase
    .from('payments')
    .upsert({
      inbox_health_id: paymentId,
      patient_id: paymentData.patient_id,
      expected_amount_cents: paymentData.expected_amount_cents || paymentData.amount_cents || 0,
      payment_method: paymentData.payment_method_type,
      status: paymentData.status || 'pending',
      successful: paymentData.successful || false,
      last_synced_at: new Date().toISOString(),
    }, {
      onConflict: 'inbox_health_id',
    })
    .select()
    .single();

  if (error) {
    console.error('Failed to upsert payment:', error);
    return { status: 'error', error: error.message };
  }

  console.log(`Payment ${paymentId} processed successfully`);
  return { status: 'processed', paymentId, localId: data.id };
}

// Handle invoice events
async function handleInvoiceEvent(body: any) {
  console.log('Processing invoice event...');
  
  const invoiceData = body.data || body.invoice || body;
  const invoiceId = invoiceData.id || invoiceData.invoice_id;
  
  if (!invoiceId) {
    return { status: 'skipped', reason: 'no_invoice_id' };
  }

  // Upsert invoice
  const { data, error } = await supabase
    .from('invoices')
    .upsert({
      inbox_health_id: invoiceId,
      patient_id: invoiceData.patient_id,
      total_balance_cents: invoiceData.total_balance_cents,
      patient_balance_cents: invoiceData.patient_balance_cents,
      insurance_balance_cents: invoiceData.total_insurance_balance_cents,
      date_of_service: invoiceData.date_of_service,
      status: invoiceData.status,
      last_synced_at: new Date().toISOString(),
    }, {
      onConflict: 'inbox_health_id',
    })
    .select()
    .single();

  if (error) {
    console.error('Failed to upsert invoice:', error);
    return { status: 'error', error: error.message };
  }

  console.log(`Invoice ${invoiceId} processed successfully`);
  return { status: 'processed', invoiceId, localId: data.id };
}

// Handle invoice payment events
async function handleInvoicePaymentEvent(body: any) {
  console.log('Processing invoice payment event...');
  
  const invoicePaymentData = body.data || body.invoice_payment || body;
  const invoicePaymentId = invoicePaymentData.id;
  
  if (!invoicePaymentId) {
    return { status: 'skipped', reason: 'no_invoice_payment_id' };
  }

  // Store invoice payment relationship
  const { data, error } = await supabase
    .from('invoice_payments')
    .upsert({
      inbox_health_id: invoicePaymentId,
      invoice_id: invoicePaymentData.invoice_id,
      payment_id: invoicePaymentData.payment_id,
      paid_amount_cents: invoicePaymentData.paid_amount_cents,
      last_synced_at: new Date().toISOString(),
    }, {
      onConflict: 'inbox_health_id',
    })
    .select()
    .single();

  if (error) {
    console.error('Failed to upsert invoice payment:', error);
    return { status: 'error', error: error.message };
  }

  console.log(`Invoice payment ${invoicePaymentId} processed successfully`);
  return { status: 'processed', invoicePaymentId, localId: data.id };
}

// GET endpoint for testing
export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'InboxHealth Webhook Endpoint',
    status: 'active',
    timestamp: new Date().toISOString(),
    supportedEvents: [
      'patient_created',
      'patient_updated',
      'payment_created',
      'payment_updated',
      'invoice_created',
      'invoice_updated',
      'invoice_payment_created',
      'invoice_payment_updated',
    ],
  });
}
