/**
 * Voice AI Custom Action: Request Callback
 * Creates contact and task for staff to call back
 */

import { NextResponse } from 'next/server';
import { getGHLClient } from '@/lib/ghl';

const CENTERED_LOCATION_ID = 'tjZJ0hbW7tD1I21hCS41';

export async function POST(request: Request) {
  try {
    const {
      first_name,
      last_name,
      phone,
      reason,
      preferred_time,
      urgency = 'medium'
    } = await request.json();

    console.log(`📞 Callback requested for ${first_name} ${last_name}: ${reason}`);

    const ghl = getGHLClient();

    // Step 1: Create or update contact
    const contact = await ghl.contacts.upsertContact({
      locationId: CENTERED_LOCATION_ID,
      firstName: first_name,
      lastName: last_name,
      phone,
      source: 'Voice AI Callback Request',
      tags: ['callback-requested', `urgency-${urgency}`]
    });

    console.log(`✅ Contact created: ${contact.contact.id}`);

    // Step 2: Create task for staff (using notes/tags as proxy since tasks require workflow setup)
    await ghl.contacts.addTags({
      contactId: contact.contact.id,
      tags: ['needs-callback']
    });

    // Step 3: Send SMS confirmation to caller
    try {
      await ghl.conversations.sendMessage({
        locationId: CENTERED_LOCATION_ID,
        contactId: contact.contact.id,
        type: 'SMS',
        message: `Hi ${first_name}! Thank you for contacting Centered. We've received your callback request. A team member will call you back${preferred_time ? ` ${preferred_time}` : ' soon'}. - Centered`
      });
    } catch (smsError) {
      console.warn('⚠️  SMS confirmation failed:', smsError);
    }

    return NextResponse.json({
      success: true,
      contactId: contact.contact.id,
      response: `Thank you, ${first_name}! I've created a callback request. One of our team members will call you back${preferred_time ? ` ${preferred_time}` : ' as soon as possible'} at ${phone}. You'll also receive a text confirmation. Is there anything else I can help you with?`,
      spokenResponse: `Thank you, ${first_name}! I've created a callback request. One of our team members will call you back${preferred_time ? ` ${preferred_time}` : ' as soon as possible'}. You'll also receive a text confirmation. Is there anything else I can help you with?`
    });
  } catch (error: any) {
    console.error('❌ Callback request failed:', error);

    return NextResponse.json({
      success: false,
      response: 'I apologize for the technical difficulty. Please call us back at your convenience, or visit our website at centered.one to submit your request online.'
    }, { status: 500 });
  }
}
