import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

// Prevent static generation - this route is dynamic only
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const body = await request.json();
    
    // Validate required fields
    if (!body.patient_id) {
      return NextResponse.json(
        { error: 'Missing required field: patient_id' },
        { status: 400 }
      );
    }

    if (!body.line_items || !Array.isArray(body.line_items) || body.line_items.length === 0) {
      return NextResponse.json(
        { error: 'At least one line item is required' },
        { status: 400 }
      );
    }

    // Verify patient exists
    const { data: patient, error: patientError } = await supabase
      .from('patients')
      .select('id')
      .eq('id', body.patient_id)
      .single();

    if (patientError || !patient) {
      return NextResponse.json(
        { error: 'Patient not found' },
        { status: 404 }
      );
    }

    // Calculate total from line items
    const total_amount_cents = body.line_items.reduce((sum: number, item: any) => {
      return sum + Math.round((parseFloat(item.amount) || 0) * 100);
    }, 0);

    // Create invoice
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert({
        inbox_health_id: null,
        patient_id: body.patient_id,
        date_of_service: body.invoice_date || new Date().toISOString().split('T')[0],
        total_amount_cents: total_amount_cents,
        paid_amount_cents: 0,
        balance_cents: total_amount_cents,
        status: 'pending',
        notes: body.description || null,
        sync_status: 'pending',
        last_synced_at: null,
      })
      .select()
      .single();

    if (invoiceError) {
      console.error('Invoice creation error:', invoiceError);
      return NextResponse.json(
        { error: 'Failed to create invoice', details: invoiceError.message },
        { status: 500 }
      );
    }

    // Create line items
    const lineItemsToInsert = body.line_items.map((item: any) => ({
      invoice_id: invoice.id,
      description: item.description,
      service_code: item.cpt_code || null,
      date_of_service: item.service_date || body.invoice_date || new Date().toISOString().split('T')[0],
      total_charge_amount_cents: Math.round((parseFloat(item.amount) || 0) * 100),
      patient_due_cents: Math.round((parseFloat(item.amount) || 0) * 100),
      quantity: parseInt(item.quantity) || 1,
      sync_status: 'pending',
    }));

    const { error: lineItemsError } = await supabase
      .from('line_items')
      .insert(lineItemsToInsert);

    if (lineItemsError) {
      console.error('Line items creation error:', lineItemsError);
      // Rollback invoice creation
      await supabase.from('invoices').delete().eq('id', invoice.id);
      return NextResponse.json(
        { error: 'Failed to create line items', details: lineItemsError.message },
        { status: 500 }
      );
    }

    // Fetch complete invoice with line items
    const { data: completeInvoice } = await supabase
      .from('invoices')
      .select(`
        *,
        patient:patients(*),
        line_items:line_items(*)
      `)
      .eq('id', invoice.id)
      .single();

    // TODO: Call Inbox Health API to create invoice there
    // const inboxHealthResponse = await fetch(`${process.env.NEXT_PUBLIC_INBOX_HEALTH_API_URL}/invoices`, {
    //   method: 'POST',
    //   headers: {
    //     'x-api-key': process.env.INBOX_HEALTH_API_KEY!,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({ invoice: body }),
    // });

    return NextResponse.json({
      success: true,
      invoice: completeInvoice,
      message: 'Invoice created successfully (local only - sync to Inbox Health pending)',
    });
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const patient_id = searchParams.get('patient_id');
    const status = searchParams.get('status');

    let query = supabase
      .from('invoices')
      .select(`
        *,
        patient:patients(id, first_name, last_name, email)
      `, { count: 'exact' })
      .order('invoice_date', { ascending: false })
      .range(offset, offset + limit - 1);

    if (patient_id) {
      query = query.eq('patient_id', patient_id);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch invoices', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      invoices: data,
      total: count,
      limit,
      offset,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
