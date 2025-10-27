import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '../../../lib/supabase';

// Prevent static generation - this route is dynamic only
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['first_name', 'last_name', 'email'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Create patient in Supabase
    const { data, error } = await supabase
      .from('patients')
      .insert({
        inbox_health_id: null, // Will be updated when synced
        first_name: body.first_name,
        last_name: body.last_name,
        email: body.email,
        cell_phone: body.phone || null,
        date_of_birth: body.date_of_birth || null,
        address_line_1: body.address_line1 || null,
        address_line_2: body.address_line2 || null,
        city: body.city || null,
        state: body.state || null,
        zip: body.zip_code || null,
        sync_status: 'pending',
        last_synced_at: null,
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to create patient', details: error.message },
        { status: 500 }
      );
    }

    // Call Inbox Health API to create patient there
    let inboxHealthPatient = null;
    let inboxHealthError = null;
    
    try {
      const inboxHealthPayload = {
        first_name: body.first_name,
        last_name: body.last_name,
        email: body.email,
        cell_phone: body.phone,
        date_of_birth: body.date_of_birth,
        address_line_1: body.address_line1,
        address_line_2: body.address_line2,
        city: body.city,
        state: body.state,
        zip: body.zip_code,
      };

      const inboxHealthResponse = await fetch(`${process.env.NEXT_PUBLIC_INBOX_HEALTH_API_URL}/patients`, {
        method: 'POST',
        headers: {
          'x-api-key': process.env.INBOX_HEALTH_API_KEY!,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ patient: inboxHealthPayload }),
      });

      if (inboxHealthResponse.ok) {
        inboxHealthPatient = await inboxHealthResponse.json();
        
        // Update local patient with Inbox Health ID
        if (inboxHealthPatient?.id) {
          await supabase
            .from('patients')
            .update({
              inbox_health_id: inboxHealthPatient.id,
              sync_status: 'synced',
              last_synced_at: new Date().toISOString(),
            })
            .eq('id', data.id);
        }
      } else {
        const errorData = await inboxHealthResponse.text();
        inboxHealthError = `Inbox Health API error: ${inboxHealthResponse.status} - ${errorData}`;
        console.error('Inbox Health API failed:', inboxHealthError);
      }
    } catch (apiError: any) {
      inboxHealthError = apiError.message;
      console.error('Failed to call Inbox Health API:', apiError);
    }

    return NextResponse.json({
      success: true,
      patient: data,
      inbox_health_sync: inboxHealthPatient ? 'success' : 'failed',
      inbox_health_id: inboxHealthPatient?.id || null,
      inbox_health_error: inboxHealthError,
      message: inboxHealthPatient 
        ? `Patient created successfully and synced to Inbox Health (ID: ${inboxHealthPatient.id})`
        : 'Patient created locally, but failed to sync to Inbox Health',
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
    // Try using Render database first, fall back to Supabase
    try {
      const { getPatients } = await import('@/lib/database');
      const patients = await getPatients();
      return NextResponse.json({
        patients,
        total: patients.length,
      });
    } catch (dbError) {
      // Fall back to Supabase if database not available
      console.log('Database not available, falling back to Supabase');
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');

    let query = supabase
      .from('patients')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Add search filter if provided
    if (search) {
      query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch patients', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      patients: data,
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
