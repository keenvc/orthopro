import { NextRequest, NextResponse } from 'next/server';
import { osmindClient } from '@/lib/osmind/client';
import { runCompleteSyncxmd } from '@/lib/osmind/sync';

export async function POST(request: NextRequest) {
  try {
    const { username, password, startDate, endDate } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Missing Osmind credentials' },
        { status: 400 }
      );
    }

    // Login to Osmind
    console.log('Authenticating with Osmind...');
    osmindClient.setCredentials(username, password);
    await osmindClient.login(username, password);

    // Run sync
    console.log('Running complete sync...');
    const result = await runCompleteSyncxmd(startDate, endDate);

    return NextResponse.json({
      success: true,
      message: 'Osmind sync completed successfully',
      summary: {
        patients: {
          synced: result.patients.synced,
          updated: result.patients.updated,
          errors: result.patients.errors.length,
        },
        appointments: {
          synced: result.appointments.synced,
          updated: result.appointments.updated,
          errors: result.appointments.errors.length,
        },
        insuranceCards: {
          synced: result.insuranceCards.synced,
          updated: result.insuranceCards.updated,
          errors: result.insuranceCards.errors.length,
        },
      },
      timestamp: result.timestamp,
    });
  } catch (error) {
    console.error('Osmind sync error:', error);
    return NextResponse.json(
      {
        error: 'Sync failed',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Use POST to trigger Osmind sync',
    example: {
      username: 'your-osmind-username',
      password: 'your-osmind-password',
      startDate: '2025-10-01',
      endDate: '2025-10-31',
    },
  });
}
