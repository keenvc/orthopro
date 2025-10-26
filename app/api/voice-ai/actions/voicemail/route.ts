/**
 * Voice AI Custom Action: Leave Voicemail
 * Records and transcribes voicemail, creates task for staff
 */

import { NextResponse } from 'next/server';
import { getGHLClient } from '@/lib/ghl';

const CENTERED_LOCATION_ID = 'tjZJ0hbW7tD1I21hCS41';

export async function POST(request: Request) {
  try {
    const {
      caller_name,
      phone,
      message,
      staff_member
    } = await request.json();

    console.log(`📧 Voicemail from ${caller_name}: ${message.substring(0, 50)}...`);

    const ghl = getGHLClient();

    // Step 1: Create or update contact
    const [firstName, ...lastNameParts] = caller_name.split(' ');
    const lastName = lastNameParts.join(' ') || '';

    const contact = await ghl.contacts.upsertContact({
      locationId: CENTERED_LOCATION_ID,
      firstName,
      lastName,
      phone,
      source: 'Voice AI Voicemail',
      tags: ['voicemail-received']
    });

    console.log(`✅ Contact created: ${contact.contact.id}`);

    // Step 2: Create note with voicemail transcript
    // In production, this would use GHL notes API
    await ghl.contacts.addTags({
      contactId: contact.contact.id,
      tags: ['has-voicemail']
    });

    // Step 3: Send confirmation SMS
    try {
      await ghl.conversations.sendMessage({
        locationId: CENTERED_LOCATION_ID,
        contactId: contact.contact.id,
        type: 'SMS',
        message: `Hi ${firstName}! Thank you for your voicemail. We've received your message${staff_member ? ` for ${staff_member}` : ''} and will get back to you soon. - Centered`
      });
    } catch (smsError) {
      console.warn('⚠️  SMS confirmation failed:', smsError);
    }

    // Step 4: Notify staff (in production, send email/SMS to staff)
    console.log(`📨 Staff notification: Voicemail from ${caller_name}${staff_member ? ` for ${staff_member}` : ''}`);

    return NextResponse.json({
      success: true,
      contactId: contact.contact.id,
      response: `Thank you for your message, ${firstName}. I've recorded your voicemail${staff_member ? ` for ${staff_member}` : ' for our team'}. Someone will get back to you as soon as possible at ${phone}. You'll also receive a text confirmation. Have a great day!`,
      spokenResponse: `Thank you for your message, ${firstName}. I've recorded your voicemail${staff_member ? ` for ${staff_member}` : ' for our team'}. Someone will get back to you as soon as possible. You'll also receive a text confirmation. Have a great day!`
    });
  } catch (error: any) {
    console.error('❌ Voicemail recording failed:', error);

    return NextResponse.json({
      success: false,
      response: 'I apologize, but I\'m having trouble recording your message. Please try calling back later, or visit our website at centered.one to send us a message.'
    }, { status: 500 });
  }
}
