/**
 * GHL AI Agent API Endpoint
 * Natural language queries and complex workflows
 */

import { NextResponse } from 'next/server';
import { GHLAIAgent } from '../../../../lib/ghl/ai-agent';

// Prevent static generation - this route is dynamic only
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';


// Store agents by session to maintain conversation history
const agentSessions = new Map<string, GHLAIAgent>();

// POST /api/ghl/ai - Execute AI query
export async function POST(request: Request) {
  try {
    const {
      prompt,
      includeHistory,
      maxTokens,
      sessionId
    } = await request.json();

    if (!prompt) {
      return NextResponse.json({
        success: false,
        error: 'prompt is required'
      }, { status: 400 });
    }

    // Get or create agent for this session
    const sid = sessionId || 'default';
    if (!agentSessions.has(sid)) {
      agentSessions.set(sid, new GHLAIAgent());
    }
    const agent = agentSessions.get(sid)!;

    // Execute query
    const result = await agent.query(prompt, {
      includeHistory: includeHistory || false,
      maxTokens: maxTokens || 4096
    });

    return NextResponse.json({
      success: true,
      response: result.response,
      toolCalls: result.toolCalls.map(tc => ({
        name: tc.name,
        input: tc.input
      })),
      sessionId: sid
    });
  } catch (error: any) {
    console.error('AI Agent error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      details: error.response?.data || error.stack
    }, { status: 500 });
  }
}

// DELETE /api/ghl/ai?sessionId=xxx - Clear conversation history
export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('sessionId') || 'default';

  const agent = agentSessions.get(sessionId);
  if (agent) {
    agent.clearHistory();
  }

  return NextResponse.json({
    success: true,
    message: 'Conversation history cleared'
  });
}

// GET /api/ghl/ai/history?sessionId=xxx - Get conversation history
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('sessionId') || 'default';

  const agent = agentSessions.get(sessionId);
  const history = agent ? agent.getHistory() : [];

  return NextResponse.json({
    success: true,
    history,
    messageCount: history.length
  });
}
