import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '../../../../lib/db';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== 'Bearer migrate-orthopro-2025') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Testing database connection...');
    console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);

    const pool = getPool();
    const client = await pool.connect();
    
    try {
      // Test 1: Simple query
      const test1 = await client.query('SELECT NOW()');
      console.log('✓ Database connected, current time:', test1.rows[0]);

      // Test 2: Check if intake_submissions table exists
      const test2 = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
          AND table_name = 'intake_submissions'
      `);
      
      const tableExists = test2.rows.length > 0;
      console.log('✓ intake_submissions table exists:', tableExists);

      // Test 3: If table exists, check columns
      let columns = [];
      if (tableExists) {
        const test3 = await client.query(`
          SELECT column_name, data_type 
          FROM information_schema.columns 
          WHERE table_name = 'intake_submissions'
          ORDER BY ordinal_position
        `);
        columns = test3.rows;
        console.log(`✓ Found ${columns.length} columns`);
      }

      return NextResponse.json({
        success: true,
        database_connected: true,
        table_exists: tableExists,
        columns: columns,
        timestamp: test1.rows[0].now
      });

    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Database test error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message,
        code: error.code,
        hasDbUrl: !!process.env.DATABASE_URL
      },
      { status: 500 }
    );
  }
}
