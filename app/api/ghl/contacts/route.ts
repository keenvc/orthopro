/**
 * GHL Contacts API Endpoints
 * Direct API for CRUD operations
 */

import { NextResponse } from 'next/server';
import { GHLContactService } from '../../../../lib/ghl/contact-service';

const contactService = new GHLContactService();

// GET /api/ghl/contacts?contactId=xxx - Get single contact
// GET /api/ghl/contacts?query=xxx - Search contacts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const contactId = searchParams.get('contactId');
  const query = searchParams.get('query');
  const tags = searchParams.get('tags')?.split(',');
  const limit = parseInt(searchParams.get('limit') || '20');

  try {
    if (contactId) {
      // Get single contact
      const contact = await contactService.getContact(contactId);
      return NextResponse.json({ success: true, contact });
    } else {
      // Search contacts
      const contacts = await contactService.searchContacts({
        query: query || undefined,
        tags,
        limit
      });
      return NextResponse.json({ success: true, contacts, count: contacts.length });
    }
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

// POST /api/ghl/contacts - Sync patient to GHL
export async function POST(request: Request) {
  try {
    const { patientId } = await request.json();

    if (!patientId) {
      return NextResponse.json({
        success: false,
        error: 'patientId is required'
      }, { status: 400 });
    }

    const ghlContactId = await contactService.syncPatientToGHL(patientId);

    return NextResponse.json({
      success: true,
      ghlContactId,
      message: 'Patient synced to GoHighLevel successfully'
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

// PUT /api/ghl/contacts - Update contact
export async function PUT(request: Request) {
  try {
    const { contactId, updates } = await request.json();

    if (!contactId) {
      return NextResponse.json({
        success: false,
        error: 'contactId is required'
      }, { status: 400 });
    }

    await contactService.updateContact(contactId, updates);

    return NextResponse.json({
      success: true,
      message: 'Contact updated successfully'
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
