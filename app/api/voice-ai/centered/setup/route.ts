/**
 * Setup Centered Voice AI Agent
 * POST /api/voice-ai/centered/setup
 * 
 * This endpoint creates the complete voice AI agent with all custom actions
 */

import { NextResponse } from 'next/server';
import { CenteredVoiceAgent } from '@/lib/ghl/centered-voice-agent';

export async function POST(request: Request) {
  try {
    console.log('🚀 Starting Centered Voice AI Agent setup...');

    const centeredAgent = new CenteredVoiceAgent();
    const result = await centeredAgent.setup();

    return NextResponse.json({
      success: true,
      message: 'Centered Voice AI Agent created successfully!',
      agentId: result.agentId,
      actionsCount: result.actions.length,
      actions: result.actions,
      nextSteps: [
        '1. Assign a Twilio phone number in GHL dashboard',
        '2. Test the agent by calling the number',
        '3. Monitor call logs at /api/voice-ai/centered/calls'
      ]
    });
  } catch (error: any) {
    console.error('❌ Setup failed:', error);

    return NextResponse.json({
      success: false,
      error: error.message,
      hint: error.message.includes('Business information not found') 
        ? 'Run POST /api/firecrawl/scrape-centered first to populate the knowledge base'
        : 'Check logs for details'
    }, { status: 500 });
  }
}

export async function GET(request: Request) {
  return NextResponse.json({
    message: 'POST to this endpoint to create the Centered Voice AI Agent',
    prerequisites: [
      '1. Firecrawl API key configured (FIRECRAWL_API_KEY)',
      '2. GHL API token configured (GHL_API_TOKEN)',
      '3. Knowledge base populated (POST /api/firecrawl/scrape-centered)',
      '4. Twilio phone number added to GHL account'
    ],
    usage: 'curl -X POST /api/voice-ai/centered/setup'
  });
}
