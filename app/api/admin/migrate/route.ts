import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    // Simple auth check - in production, use proper authentication
    const authHeader = request.headers.get('authorization');
    if (authHeader !== 'Bearer migrate-orthopro-2025') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('Starting database migration...');

    // Add mechanism_of_injury column
    await prisma.$executeRawUnsafe(`
      ALTER TABLE intake_submissions
      ADD COLUMN IF NOT EXISTS mechanism_of_injury VARCHAR(50);
    `);

    // Add work_activity column
    await prisma.$executeRawUnsafe(`
      ALTER TABLE intake_submissions
      ADD COLUMN IF NOT EXISTS work_activity VARCHAR(100);
    `);

    // Add index
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS idx_intake_mechanism 
      ON intake_submissions(mechanism_of_injury);
    `);

    // Verify columns exist
    const columns = await prisma.$queryRawUnsafe<Array<{
      column_name: string;
      data_type: string;
      character_maximum_length: number | null;
    }>>(`
      SELECT column_name, data_type, character_maximum_length 
      FROM information_schema.columns 
      WHERE table_name = 'intake_submissions' 
        AND column_name IN ('mechanism_of_injury', 'work_activity')
      ORDER BY column_name;
    `);

    console.log('Migration completed successfully');
    console.log('Columns added:', columns);

    return NextResponse.json({
      success: true,
      message: 'Database migration applied successfully',
      columns: columns,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Migration error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Migration failed', 
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
