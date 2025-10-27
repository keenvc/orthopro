import { NextResponse } from 'next/server';
import { getClinicDashboardStats } from '../../../../lib/clinic';

export async function GET(request: Request) {
  try {
    const stats = await getClinicDashboardStats();

    return NextResponse.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}
