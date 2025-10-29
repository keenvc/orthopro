import { NextResponse } from 'next/server';
import { getPool } from '../../../lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: {
      nodeEnv: process.env.NODE_ENV,
      hasDbUrl: !!process.env.DATABASE_URL,
      dbUrlFormat: process.env.DATABASE_URL ? 'configured' : 'missing'
    },
    database: {
      status: 'unknown',
      error: null as string | null
    }
  };

  // Test database connection
  try {
    const pool = getPool();
    const client = await pool.connect();
    
    try {
      const result = await client.query('SELECT NOW() as current_time, version() as version');
      health.database.status = 'connected';
      health.database = {
        ...health.database,
        currentTime: result.rows[0].current_time,
        version: result.rows[0].version.split(' ')[0] + ' ' + result.rows[0].version.split(' ')[1]
      };
    } finally {
      client.release();
    }
  } catch (error: any) {
    health.database.status = 'error';
    health.database.error = error.message;
    health.status = 'degraded';
  }

  const statusCode = health.status === 'ok' ? 200 : 503;

  return NextResponse.json(health, { status: statusCode });
}
