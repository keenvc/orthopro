/**
 * API endpoint to scrape Centered website
 * POST /api/firecrawl/scrape-centered
 */

import { NextResponse } from 'next/server';
import { scrapeCenteredWebsite } from '../../../../lib/firecrawl/centered-scraper';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    console.log('🔍 Starting Centered website scrape...');
    
    const businessInfo = await scrapeCenteredWebsite();

    return NextResponse.json({
      success: true,
      data: businessInfo,
      message: 'Centered knowledge base updated successfully'
    });
  } catch (error: any) {
    console.error('❌ Scrape failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

export async function GET(request: Request) {
  return NextResponse.json({
    message: 'POST to this endpoint to scrape Centered website',
    usage: 'curl -X POST /api/firecrawl/scrape-centered'
  });
}
