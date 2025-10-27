/**
 * Voice AI Knowledge Base Query API
 * POST /api/voice-ai/knowledge
 * 
 * This endpoint is called by Voice AI custom actions to query business information
 */

import { NextResponse } from 'next/server';
import { queryKnowledgeBase, getCenteredBusinessInfo } from '../../../../lib/firecrawl/centered-scraper';

export async function POST(request: Request) {
  try {
    const { query, type } = await request.json();

    if (!query) {
      return NextResponse.json({
        success: false,
        error: 'Query parameter is required'
      }, { status: 400 });
    }

    console.log(`📖 Knowledge base query: ${query}`);

    // Get response from knowledge base
    const response = await queryKnowledgeBase(query);

    return NextResponse.json({
      success: true,
      response,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('❌ Knowledge query failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      response: 'I apologize, but I\'m having trouble accessing our information right now. Please visit our website at centered.one or call back later.'
    }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    // Return full business info for debugging
    const info = await getCenteredBusinessInfo();

    if (!info) {
      return NextResponse.json({
        success: false,
        message: 'Knowledge base not yet populated. Run POST /api/firecrawl/scrape-centered first.'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: info
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
