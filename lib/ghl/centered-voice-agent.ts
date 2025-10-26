/**
 * Centered Mental Health Clinic - Voice AI Agent
 * Complete setup with custom actions for appointment booking, callbacks, and information lookup
 */

import { VoiceAIService, VoiceAgentConfig, CustomAction } from './voice-ai-service';
import { getCenteredBusinessInfo } from '../firecrawl/centered-scraper';

const CENTERED_LOCATION_ID = 'tjZJ0hbW7tD1I21hCS41';
const WEBHOOK_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://centered-remits.onrender.com';

export class CenteredVoiceAgent {
  private voiceAIService = new VoiceAIService();
  private agentId?: string;

  /**
   * Create and configure complete Centered voice AI agent
   */
  async setup(): Promise<{ agentId: string; actions: string[] }> {
    console.log('🏥 Setting up Centered Voice AI Agent...');

    // Step 1: Get business info from knowledge base
    const businessInfo = await getCenteredBusinessInfo();
    if (!businessInfo) {
      throw new Error('Business information not found. Run POST /api/firecrawl/scrape-centered first.');
    }

    // Step 2: Create the voice agent
    const agentConfig: VoiceAgentConfig = {
      name: 'Centered Assistant',
      locationId: CENTERED_LOCATION_ID,
      businessName: 'Centered',
      voice: 'professional-female', // Request professional, empathetic voice
      greeting: 'Hello! Thank you for calling Centered, a center for integrative healing. My name is Sarah, and I\'m here to help you. How may I assist you today?',
      systemPrompt: this.buildSystemPrompt(businessInfo),
      goals: [
        'Provide information about services and location',
        'Check appointment availability and book appointments',
        'Capture callback requests',
        'Take voicemail messages',
        'Transfer to staff when needed'
      ],
      businessHours: {
        timezone: 'America/New_York',
        schedule: {
          monday: { open: '08:00', close: '18:00' },
          tuesday: { open: '08:00', close: '18:00' },
          wednesday: { open: '08:00', close: '18:00' },
          thursday: { open: '08:00', close: '18:00' },
          friday: { open: '08:00', close: '18:00' },
          saturday: 'closed',
          sunday: 'closed'
        }
      },
      fallbackBehavior: {
        afterHours: 'voicemail',
      }
    };

    const agent = await this.voiceAIService.createAgent(agentConfig);
    this.agentId = agent.id;

    console.log(`✅ Agent created: ${agent.id}`);

    // Step 3: Add all custom actions
    const actionIds: string[] = [];

    // Action 1: Get Business Information
    const businessInfoAction = await this.voiceAIService.addCustomAction(agent.id, {
      name: 'get_business_info',
      description: 'Get information about Centered clinic (address, services, hours, policies)',
      webhookUrl: `${WEBHOOK_BASE_URL}/api/voice-ai/actions/business-info`,
      method: 'POST',
      parameters: [
        {
          name: 'query',
          type: 'string',
          description: 'What information the caller is asking about (e.g., "address", "services", "hours")',
          required: true
        }
      ],
      conversationTriggers: [
        'where are you located',
        'what is your address',
        'what services',
        'what do you offer',
        'tell me about',
        'how much',
        'pricing',
        'hours',
        'when are you open'
      ]
    });
    actionIds.push(businessInfoAction.id);
    console.log('✅ Action added: get_business_info');

    // Action 2: Check Appointment Availability
    const checkAvailabilityAction = await this.voiceAIService.addCustomAction(agent.id, {
      name: 'check_availability',
      description: 'Check available appointment slots for a specific service and date range',
      webhookUrl: `${WEBHOOK_BASE_URL}/api/voice-ai/actions/check-availability`,
      method: 'POST',
      parameters: [
        {
          name: 'service_type',
          type: 'string',
          description: 'Type of service: "therapy", "psychiatric_care", or "ketamine_therapy"',
          required: true
        },
        {
          name: 'preferred_date',
          type: 'string',
          description: 'Preferred date in YYYY-MM-DD format',
          required: false
        },
        {
          name: 'preferred_time',
          type: 'string',
          description: 'Preferred time of day: "morning", "afternoon", or "evening"',
          required: false
        }
      ],
      conversationTriggers: [
        'book appointment',
        'schedule',
        'availability',
        'available times',
        'open slots',
        'make appointment'
      ]
    });
    actionIds.push(checkAvailabilityAction.id);
    console.log('✅ Action added: check_availability');

    // Action 3: Book Appointment
    const bookAppointmentAction = await this.voiceAIService.addCustomAction(agent.id, {
      name: 'book_appointment',
      description: 'Book an appointment after confirming details with the caller',
      webhookUrl: `${WEBHOOK_BASE_URL}/api/voice-ai/actions/book-appointment`,
      method: 'POST',
      parameters: [
        {
          name: 'first_name',
          type: 'string',
          description: 'Patient first name',
          required: true
        },
        {
          name: 'last_name',
          type: 'string',
          description: 'Patient last name',
          required: true
        },
        {
          name: 'phone',
          type: 'string',
          description: 'Patient phone number',
          required: true
        },
        {
          name: 'email',
          type: 'string',
          description: 'Patient email address',
          required: true
        },
        {
          name: 'service_type',
          type: 'string',
          description: 'Type of service requested',
          required: true
        },
        {
          name: 'appointment_date',
          type: 'string',
          description: 'Appointment date in YYYY-MM-DD format',
          required: true
        },
        {
          name: 'appointment_time',
          type: 'string',
          description: 'Appointment time in HH:MM format (24-hour)',
          required: true
        },
        {
          name: 'notes',
          type: 'string',
          description: 'Any additional notes or reason for visit',
          required: false
        }
      ],
      conversationTriggers: [
        'yes book it',
        'confirm',
        'that works',
        'sounds good'
      ]
    });
    actionIds.push(bookAppointmentAction.id);
    console.log('✅ Action added: book_appointment');

    // Action 4: Request Callback
    const callbackAction = await this.voiceAIService.addCustomAction(agent.id, {
      name: 'request_callback',
      description: 'Create a callback request when patient wants to speak with staff',
      webhookUrl: `${WEBHOOK_BASE_URL}/api/voice-ai/actions/request-callback`,
      method: 'POST',
      parameters: [
        {
          name: 'first_name',
          type: 'string',
          description: 'Caller first name',
          required: true
        },
        {
          name: 'last_name',
          type: 'string',
          description: 'Caller last name',
          required: true
        },
        {
          name: 'phone',
          type: 'string',
          description: 'Callback phone number',
          required: true
        },
        {
          name: 'reason',
          type: 'string',
          description: 'Reason for callback',
          required: true
        },
        {
          name: 'preferred_time',
          type: 'string',
          description: 'When they prefer to be called back',
          required: false
        },
        {
          name: 'urgency',
          type: 'string',
          description: 'Urgency level: "low", "medium", or "high"',
          required: false
        }
      ],
      conversationTriggers: [
        'call me back',
        'speak with someone',
        'talk to staff',
        'reach me at',
        'return my call'
      ]
    });
    actionIds.push(callbackAction.id);
    console.log('✅ Action added: request_callback');

    // Action 5: Leave Voicemail
    const voicemailAction = await this.voiceAIService.addCustomAction(agent.id, {
      name: 'leave_voicemail',
      description: 'Record and transcribe voicemail message (typically after hours)',
      webhookUrl: `${WEBHOOK_BASE_URL}/api/voice-ai/actions/voicemail`,
      method: 'POST',
      parameters: [
        {
          name: 'caller_name',
          type: 'string',
          description: 'Name of caller',
          required: true
        },
        {
          name: 'phone',
          type: 'string',
          description: 'Caller phone number',
          required: true
        },
        {
          name: 'message',
          type: 'string',
          description: 'Transcribed voicemail message',
          required: true
        },
        {
          name: 'staff_member',
          type: 'string',
          description: 'Specific staff member to reach (if mentioned)',
          required: false
        }
      ],
      conversationTriggers: [
        'leave message',
        'voicemail',
        'message for'
      ]
    });
    actionIds.push(voicemailAction.id);
    console.log('✅ Action added: leave_voicemail');

    console.log(`\n🎉 Centered Voice AI Agent fully configured!`);
    console.log(`Agent ID: ${agent.id}`);
    console.log(`Actions: ${actionIds.length} custom actions added`);

    return {
      agentId: agent.id,
      actions: actionIds
    };
  }

  /**
   * Build comprehensive system prompt for the agent
   */
  private buildSystemPrompt(businessInfo: any): string {
    const servicesText = businessInfo.services
      .map((s: any) => `- ${s.name}: ${s.description}`)
      .join('\n');

    return `You are Sarah, a professional and empathetic virtual assistant for Centered, a mental health center offering integrated care.

**About Centered:**
${businessInfo.description}

**Services We Offer:**
${servicesText}

**Our Values:**
${businessInfo.policies.safeSpace}

${businessInfo.policies.nonDiscrimination}

**Your Role:**
1. Greet callers warmly and professionally
2. Answer questions about our services, location, and availability
3. Help schedule appointments efficiently
4. Capture callback requests when needed
5. Take voicemail messages after hours or upon request
6. Always maintain patient confidentiality and HIPAA compliance

**Important Guidelines:**
- Be empathetic and understanding - mental health is sensitive
- Never make medical diagnoses or provide medical advice
- For emergencies, direct them to call 911 or visit the nearest ER
- For clinical questions, offer to schedule a consultation
- Confirm all appointment details (date, time, service, contact info)
- Send SMS confirmation after booking appointments
- Always get permission before adding to any mailing lists

**Tone:**
- Professional yet warm
- Patient and not rushed
- Respectful of confidentiality
- Clear and reassuring

**When Unsure:**
If you don't know the answer or the request is beyond your capabilities, offer to:
1. Have a staff member call them back
2. Leave a message for a specific staff member
3. Direct them to our website: ${businessInfo.website}

Remember: You're often the first point of contact. Make every caller feel welcomed, heard, and supported.`;
  }

  /**
   * Get agent ID
   */
  getAgentId(): string | undefined {
    return this.agentId;
  }

  /**
   * Update agent configuration
   */
  async update(updates: Partial<VoiceAgentConfig>): Promise<void> {
    if (!this.agentId) {
      throw new Error('Agent not set up yet. Call setup() first.');
    }

    await this.voiceAIService.updateAgent(this.agentId, updates);
    console.log('✅ Centered Voice AI Agent updated');
  }

  /**
   * Delete agent
   */
  async teardown(): Promise<void> {
    if (!this.agentId) {
      throw new Error('Agent not set up yet. Call setup() first.');
    }

    await this.voiceAIService.deleteAgent(this.agentId);
    console.log('✅ Centered Voice AI Agent deleted');
    this.agentId = undefined;
  }

  /**
   * Get call logs for Centered agent
   */
  async getCallLogs(options?: {
    startDate?: string;
    endDate?: string;
    limit?: number;
  }): Promise<any[]> {
    if (!this.agentId) {
      throw new Error('Agent not set up yet. Call setup() first.');
    }

    return await this.voiceAIService.getCallLogs(this.agentId, options);
  }
}
