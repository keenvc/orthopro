/**
 * GHL Calendar Management API
 * Create and manage calendars for staff members
 */

import { NextResponse } from 'next/server';
import { CalendarManagementService } from '@/lib/ghl/calendar-service';

const calendarService = new CalendarManagementService();

/**
 * GET - List all calendars in Centered subaccount
 */
export async function GET(request: Request) {
  try {
    const calendars = await calendarService.getCalendars();

    return NextResponse.json({
      success: true,
      calendars,
      count: calendars.length
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

/**
 * POST - Create a personal calendar for a staff member
 */
export async function POST(request: Request) {
  try {
    const { userId, firstName, lastName, slug } = await request.json();

    if (!userId || !firstName || !lastName || !slug) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: userId, firstName, lastName, slug'
      }, { status: 400 });
    }

    const calendar = await calendarService.createPersonalCalendar(
      userId,
      firstName,
      lastName,
      slug
    );

    return NextResponse.json({
      success: true,
      calendar,
      message: `Calendar created for ${firstName} ${lastName}`
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
