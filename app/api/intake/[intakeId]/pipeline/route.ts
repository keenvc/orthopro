import { NextResponse } from 'next/server';
import { getSupabaseClient } from '../../../../../lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { intakeId: string } }
) {
  try {
    const { intakeId } = params;
    const supabase = getSupabaseClient();
    
    const { data, error } = await supabase
      .from('intake_submissions')
      .select('pipeline_status')
      .eq('id', intakeId)
      .single();
    
    if (error) throw error;
    
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Pipeline fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pipeline status', details: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { intakeId: string } }
) {
  try {
    const { intakeId } = params;
    const body = await request.json();
    const supabase = getSupabaseClient();
    
    const { data, error } = await supabase
      .from('intake_submissions')
      .update({
        pipeline_status: body.pipeline,
        updated_at: new Date().toISOString()
      })
      .eq('id', intakeId)
      .select()
      .single();
    
    if (error) throw error;
    
    return NextResponse.json({
      success: true,
      data
    });
  } catch (error: any) {
    console.error('Pipeline update error:', error);
    return NextResponse.json(
      { error: 'Failed to update pipeline status', details: error.message },
      { status: 500 }
    );
  }
}
