import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '../../../../lib/db';

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
    console.log('DATABASE_URL configured:', !!process.env.DATABASE_URL);

    const pool = getPool();
    const client = await pool.connect();
    
    try {
      // Add mechanism_of_injury column
      await client.query(`
        ALTER TABLE intake_submissions
        ADD COLUMN IF NOT EXISTS mechanism_of_injury VARCHAR(50);
      `);
      console.log('✓ Added mechanism_of_injury column');

      // Add work_activity column
      await client.query(`
        ALTER TABLE intake_submissions
        ADD COLUMN IF NOT EXISTS work_activity VARCHAR(100);
      `);
      console.log('✓ Added work_activity column');

      // Add index
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_intake_mechanism 
        ON intake_submissions(mechanism_of_injury);
      `);
      console.log('✓ Created index on mechanism_of_injury');

      // Verify columns exist
      const result = await client.query(`
        SELECT column_name, data_type, character_maximum_length 
        FROM information_schema.columns 
        WHERE table_name = 'intake_submissions' 
          AND column_name IN ('mechanism_of_injury', 'work_activity')
        ORDER BY column_name;
      `);

      console.log('Migration completed successfully');
      console.log('Columns verified:', result.rows);

      return NextResponse.json({
        success: true,
        message: 'Database migration applied successfully',
        columns: result.rows,
        timestamp: new Date().toISOString()
      });

    } finally {
      client.release();
    }

  } catch (error: any) {
    console.error('Migration error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Migration failed', 
        details: error.message,
        code: error.code,
        hint: error.hint,
        hasDbUrl: !!process.env.DATABASE_URL
      },
      { status: 500 }
    );
  }
}
