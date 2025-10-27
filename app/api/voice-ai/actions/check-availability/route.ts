/**
 * Voice AI Custom Action: Check Appointment Availability
 * Returns available time slots for booking
 */

import { NextResponse } from 'next/server';
import { getGHLClient, GHL_CONFIG } from '../../../../../lib/ghl';

export async function POST(request: Request) {
  try {
    const { service_type, preferred_date, preferred_time } = await request.json();

    console.log(`📅 Checking availability for ${service_type} on ${preferred_date || 'any date'}`);

    const ghl = getGHLClient();

    // Get Centered calendars
    const calendars = await ghl.calendars.getCalendars({
      locationId: 'tjZJ0hbW7tD1I21hCS41'
    });

    if (!calendars?.calendars || calendars.calendars.length === 0) {
      return NextResponse.json({
        success: false,
        response: 'I apologize, but I\'m having trouble accessing our scheduling system right now. Would you like me to have someone call you back to schedule your appointment?'
      });
    }

    // For demo purposes, return mock availability
    // In production, this would query actual calendar availability
    const now = new Date();
    const targetDate = preferred_date ? new Date(preferred_date) : new Date(now.getTime() + 24 * 60 * 60 * 1000);
    
    // Generate 3 available slots
    const slots = [
      {
        date: targetDate.toISOString().split('T')[0],
        time: '09:00',
        timeDisplay: '9:00 AM'
      },
      {
        date: targetDate.toISOString().split('T')[0],
        time: '14:00',
        timeDisplay: '2:00 PM'
      },
      {
        date: targetDate.toISOString().split('T')[0],
        time: '16:30',
        timeDisplay: '4:30 PM'
      }
    ];

    const dateDisplay = targetDate.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });

    const slotsText = slots.map((s, i) => `${i + 1}. ${s.timeDisplay}`).join(', ');

    return NextResponse.json({
      success: true,
      slots,
      response: `Great! I have the following times available for ${service_type.replace('_', ' ')} on ${dateDisplay}: ${slotsText}. Which time works best for you?`,
      spokenResponse: `Great! I have the following times available for ${service_type.replace('_', ' ')} on ${dateDisplay}: ${slotsText}. Which time works best for you?`
    });
  } catch (error: any) {
    console.error('❌ Availability check failed:', error);

    return NextResponse.json({
      success: false,
      response: 'I\'m having trouble checking availability right now. Would you like me to have our scheduling coordinator call you back?'
    }, { status: 500 });
  }
}
