import { NextResponse } from 'next/server';
import { getSupabaseClient } from '../../../../lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { intakeId, prescription, personalInfoNotes, symptomsNotes, diagnosisNotes } = body;
    
    if (!intakeId) {
      return NextResponse.json(
        { error: 'Missing intake ID' },
        { status: 400 }
      );
    }
    
    const supabase = getSupabaseClient();
    
    // Upsert doctor notes (insert or update)
    const { data, error } = await supabase
      .from('doctor_notes')
      .upsert({
        intake_id: intakeId,
        prescription,
        personal_info_notes: personalInfoNotes,
        symptoms_notes: symptomsNotes,
        diagnosis_notes: diagnosisNotes,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'intake_id'
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return NextResponse.json({
      success: true,
      data
    });
  } catch (error: any) {
    console.error('Doctor notes save error:', error);
    return NextResponse.json(
      { error: 'Failed to save doctor notes', details: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const intakeId = searchParams.get('intakeId');
    
    if (!intakeId) {
      return NextResponse.json(
        { error: 'Missing intake ID' },
        { status: 400 }
      );
    }
    
    const supabase = getSupabaseClient();
    
    const { data, error } = await supabase
      .from('doctor_notes')
      .select('*')
      .eq('intake_id', intakeId)
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = not found
      throw error;
    }
    
    return NextResponse.json({
      success: true,
      data: data || null
    });
  } catch (error: any) {
    console.error('Doctor notes fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch doctor notes', details: error.message },
      { status: 500 }
    );
  }
}
