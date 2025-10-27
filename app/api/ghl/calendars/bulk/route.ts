/**
 * Bulk Calendar Creation API
 * Create personal calendars for multiple staff members
 */

import { NextResponse } from 'next/server';
import { CalendarManagementService } from '../../../../../lib/ghl/calendar-service';

// Prevent static generation - this route is dynamic only
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * POST - Create multiple calendars
 * Body: { users: Array<{userId, firstName, lastName, slug}> }
 */
export async function POST(request: Request) {
  try {
    const calendarService = new CalendarManagementService();
    const { users } = await request.json();

    if (!Array.isArray(users) || users.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Invalid request. Expected array of users.'
      }, { status: 400 });
    }

    console.log(`📅 Creating ${users.length} calendars...`);

    const result = await calendarService.bulkCreateCalendars(users);

    return NextResponse.json({
      success: true,
      created: result.successful.length,
      failed: result.failed.length,
      calendars: result.successful,
      failures: result.failed,
      message: `Created ${result.successful.length} calendars. ${result.failed.length} failed.`
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
