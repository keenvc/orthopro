import { NextResponse } from 'next/server';
import { getClinicalNotesByClinic } from '../../../../lib/clinic';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const clinic = searchParams.get('clinic') || 'centered-one';

    const notes = await getClinicalNotesByClinic(clinic);

    return NextResponse.json({
      success: true,
      count: notes.length,
      data: notes
    });
  } catch (error) {
    console.error('Error fetching clinical notes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch clinical notes' },
      { status: 500 }
    );
  }
}
