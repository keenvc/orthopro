/**
 * GHL AI Workflows API Endpoint
 * Pre-defined automated workflows
 */

import { NextResponse } from 'next/server';
import { GHLAIAgent } from '../../../../../lib/ghl/ai-agent';

export async function POST(request: Request) {
  try {
    const { workflow, params } = await request.json();

    if (!workflow) {
      return NextResponse.json({
        success: false,
        error: 'workflow name is required'
      }, { status: 400 });
    }

    const agent = new GHLAIAgent();
    const result = await agent.executeWorkflow(workflow, params);

    return NextResponse.json({
      success: true,
      workflow,
      response: result.response,
      toolCalls: result.toolCalls.length,
      details: result.toolCalls.map((tc: any) => ({
        name: tc.name,
        input: tc.input
      }))
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

// GET /api/ghl/ai/workflows - List available workflows
export async function GET() {
  const workflows = [
    {
      name: 'send-appointment-reminders',
      description: 'Send SMS reminders for tomorrow\'s appointments',
      schedule: 'Daily at 8 AM'
    },
    {
      name: 'follow-up-unpaid-invoices',
      description: 'Send payment reminders for overdue invoices (30+ days)',
      schedule: 'Weekly on Monday'
    },
    {
      name: 'qualify-new-leads',
      description: 'Analyze and tag new leads as hot/warm/cold',
      schedule: 'Daily at 9 AM'
    },
    {
      name: 'sync-all-patients',
      description: 'Bulk sync all unsynced patients to GHL',
      schedule: 'On demand'
    },
    {
      name: 'clean-duplicate-contacts',
      description: 'Find and report duplicate contacts',
      schedule: 'Weekly on Sunday'
    },
    {
      name: 'daily-engagement-report',
      description: 'Generate daily activity summary',
      schedule: 'Daily at 5 PM'
    }
  ];

  return NextResponse.json({
    success: true,
    workflows,
    count: workflows.length
  });
}
