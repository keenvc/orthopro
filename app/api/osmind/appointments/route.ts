import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/database';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    let where: any = {};

    if (patientId) {
      where.patient_id = patientId;
    }

    if (startDate || endDate) {
      where.appointment_date = {};
      if (startDate) {
        where.appointment_date.gte = new Date(startDate);
      }
      if (endDate) {
        where.appointment_date.lte = new Date(endDate);
      }
    }

    const [appointments, total] = await Promise.all([
      prisma.osmind_appointments.findMany({
        where,
        include: {
          patient: {
            select: {
              id: true,
              osmind_id: true,
              first_name: true,
              last_name: true,
              email: true,
            },
          },
        },
        orderBy: { appointment_date: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.osmind_appointments.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: appointments,
      pagination: {
        total,
        limit,
        offset,
        page: Math.ceil(offset / limit) + 1,
      },
    });
  } catch (error) {
    console.error('Error fetching osmind appointments:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch appointments',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
