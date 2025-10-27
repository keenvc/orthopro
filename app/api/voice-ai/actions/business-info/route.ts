/**
 * Voice AI Custom Action: Get Business Information
 * Called by Voice AI agent when caller asks about clinic details
 */

import { NextResponse } from 'next/server';
import { queryKnowledgeBase } from '../../../../../lib/firecrawl/centered-scraper';

export async function POST(request: Request) {
  try {
    const { query } = await request.json();

    console.log(`📖 Voice AI requesting business info: ${query}`);

    // Query knowledge base
    const response = await queryKnowledgeBase(query);

    return NextResponse.json({
      success: true,
      response,
      // This will be spoken by the voice AI agent
      spokenResponse: response
    });
  } catch (error: any) {
    console.error('❌ Business info lookup failed:', error);

    return NextResponse.json({
      success: false,
      response: 'I apologize, but I\'m having trouble accessing that information right now. You can visit our website at centered.one, or I can have someone call you back with that information.',
      spokenResponse: 'I apologize, but I\'m having trouble accessing that information right now. You can visit our website at centered dot one, or I can have someone call you back with that information.'
    }, { status: 500 });
  }
}
