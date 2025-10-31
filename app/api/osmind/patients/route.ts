import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/database';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let where: any = {};

    if (search) {
      where = {
        OR: [
          { first_name: { contains: search, mode: 'insensitive' } },
          { last_name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      };
    }

    const [patients, total] = await Promise.all([
      prisma.osmind_patients.findMany({
        where,
        include: {
          appointments: true,
          insurance_cards: true,
        },
        orderBy: { synced_at: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.osmind_patients.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: patients,
      pagination: {
        total,
        limit,
        offset,
        page: Math.ceil(offset / limit) + 1,
      },
    });
  } catch (error) {
    console.error('Error fetching osmind patients:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch patients',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
