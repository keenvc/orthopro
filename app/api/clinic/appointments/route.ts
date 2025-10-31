import { NextResponse } from 'next/server';
import { getUpcomingAppointments, getAppointmentStats } from '../../../../lib/clinic';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const clinic = searchParams.get('clinic') || 'centered-one';
    const type = searchParams.get('type');

    if (type === 'stats') {
      const stats = await getAppointmentStats(clinic);
      return NextResponse.json({
        success: true,
        data: stats
      });
    }

    const appointments = await getUpcomingAppointments(clinic);

    return NextResponse.json({
      success: true,
      count: appointments.length,
      data: appointments
    });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch appointments' },
      { status: 500 }
    );
  }
}
