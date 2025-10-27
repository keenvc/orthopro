/**
 * GHL Integration Test Endpoint
 * Tests both Direct API and AI Agent
 */

import { NextResponse } from 'next/server';
import { getGHLClient } from '../../../../lib/ghl';
import { GHLAIAgent } from '../../../../lib/ghl/ai-agent';

// Prevent static generation - this route is dynamic only
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';


export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const method = searchParams.get('method') || 'direct'; // 'direct', 'ai', or 'both'

  const results: any = {
    success: true,
    tests: {}
  };

  try {
    // Test Direct API
    if (method === 'direct' || method === 'both') {
      const ghl = getGHLClient();
      
      const locations = await ghl.locations.searchLocations({});
      
      results.tests.directAPI = {
        status: 'success',
        locationCount: locations.locations?.length || 0,
        locations: locations.locations?.map(l => ({
          id: l.id,
          name: l.name,
          city: l.city
        }))
      };
    }

    // Test AI Agent
    if (method === 'ai' || method === 'both') {
      const agent = new GHLAIAgent();
      
      const aiResult = await agent.query(
        'How many locations do we have? List their names.'
      );
      
      results.tests.aiAgent = {
        status: 'success',
        response: aiResult.response,
        toolCallsExecuted: aiResult.toolCalls.length,
        toolCalls: aiResult.toolCalls.map(tc => tc.name)
      };
    }

    return NextResponse.json(results);
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      tests: results.tests
    }, { status: 500 });
  }
}
