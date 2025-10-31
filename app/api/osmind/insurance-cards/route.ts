import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/database';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patientId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let where: any = {};

    if (patientId) {
      where.patient_id = patientId;
    }

    const [cards, total] = await Promise.all([
      prisma.osmind_insurance_cards.findMany({
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
        orderBy: { synced_at: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.osmind_insurance_cards.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: cards,
      pagination: {
        total,
        limit,
        offset,
        page: Math.ceil(offset / limit) + 1,
      },
    });
  } catch (error) {
    console.error('Error fetching osmind insurance cards:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch insurance cards',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
