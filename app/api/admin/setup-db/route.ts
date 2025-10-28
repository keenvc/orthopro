import { NextRequest, NextResponse } from 'next/server';
import { getPool } from '../../../../lib/db';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== 'Bearer migrate-orthopro-2025') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Setting up database schema...');
    
    const pool = getPool();
    const client = await pool.connect();
    
    try {
      // Create intake_submissions table
      await client.query(`
        CREATE TABLE IF NOT EXISTS intake_submissions (
          id SERIAL PRIMARY KEY,
          injury_date DATE,
          injury_time TIME,
          injury_location TEXT,
          injury_description TEXT,
          mechanism_of_injury TEXT,
          work_activity TEXT,
          employer_name TEXT,
          workers_comp_claim_number TEXT,
          previous_injuries TEXT,
          current_medications TEXT,
          allergies TEXT,
          medical_history TEXT,
          pain_level INTEGER,
          symptoms TEXT,
          affected_body_parts TEXT,
          ai_diagnoses JSONB,
          status TEXT DEFAULT 'pending',
          submitted_at TIMESTAMP DEFAULT NOW(),
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );
      `);
      
      console.log('✓ intake_submissions table created');
      
      // Check if table exists now
      const checkTable = await client.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'intake_submissions'
        ORDER BY ordinal_position
      `);
      
      return NextResponse.json({
        success: true,
        message: 'Database schema created successfully',
        columns: checkTable.rows,
        columnCount: checkTable.rows.length
      });

    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Setup error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message,
        code: error.code,
        detail: error.detail,
        hasDbUrl: !!process.env.DATABASE_URL
      },
      { status: 500 }
    );
  }
}
