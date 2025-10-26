# Centered Voice AI Agent - Setup Guide

## Overview
Complete voice AI agent for Centered mental health clinic with:
- Business information lookup from Firecrawl-scraped knowledge base
- Appointment availability checking and booking
- Callback request handling
- Voicemail recording and transcription
- Integration with GoHighLevel CRM
- Twilio phone number support

## Architecture

```
Twilio Phone Number → GHL Voice AI Agent → Custom Actions (Webhooks) → Next.js API Routes
                              ↓
                      Knowledge Base (Firecrawl)
                              ↓
                      GoHighLevel CRM
```

## Prerequisites

### 1. Environment Variables
Add to `.env.local` and Render environment:

```env
# Firecrawl (for website scraping)
FIRECRAWL_API_KEY=your_firecrawl_api_key

# GoHighLevel (already configured)
GHL_API_TOKEN=pit-a041bdc6-f482-46c6-89b6-5daf5fef1ce2
GHL_LOCATION_ID=GOQ8q3ZfbnrudWOHRNNL

# Centered Location
GHL_LOCATION_CENTERED=tjZJ0hbW7tD1I21hCS41

# App URL (for webhooks)
NEXT_PUBLIC_APP_URL=https://centered-remits.onrender.com
```

### 2. Get Firecrawl API Key
1. Visit https://firecrawl.dev
2. Sign up for an account
3. Get your API key from dashboard
4. Add to environment variables

### 3. Twilio Phone Number
1. Log into GoHighLevel dashboard
2. Go to Settings → Phone Numbers
3. Add a Twilio phone number (or use existing)
4. Note the phone number ID for assignment

## Setup Steps

### Step 1: Populate Knowledge Base

Scrape the Centered website to create the knowledge base:

```bash
curl -X POST https://centered-remits.onrender.com/api/firecrawl/scrape-centered
```

**Response:**
```json
{
  "success": true,
  "data": {
    "name": "Centered",
    "description": "...",
    "services": [...],
    "policies": {...}
  }
}
```

### Step 2: Check Status

Verify all prerequisites are met:

```bash
curl https://centered-remits.onrender.com/api/voice-ai/centered/status
```

**Response:**
```json
{
  "success": true,
  "status": "ready-to-setup",
  "checks": {
    "firecrawlApiKey": true,
    "ghlApiToken": true,
    "knowledgeBase": true,
    "agent": false
  },
  "nextSteps": [
    "Run POST /api/voice-ai/centered/setup to create the agent"
  ]
}
```

### Step 3: Create Voice AI Agent

Create the complete agent with all custom actions:

```bash
curl -X POST https://centered-remits.onrender.com/api/voice-ai/centered/setup
```

**Response:**
```json
{
  "success": true,
  "message": "Centered Voice AI Agent created successfully!",
  "agentId": "agent_xxxxxxxxxxxxx",
  "actionsCount": 5,
  "actions": [
    "action_business_info",
    "action_check_availability",
    "action_book_appointment",
    "action_callback",
    "action_voicemail"
  ],
  "nextSteps": [
    "1. Assign a Twilio phone number in GHL dashboard",
    "2. Test the agent by calling the number",
    "3. Monitor call logs at /api/voice-ai/centered/calls"
  ]
}
```

**Save the `agentId` - you'll need it for the next steps!**

### Step 4: Assign Phone Number

#### Option A: Via GHL Dashboard (Recommended)
1. Log into https://app.gohighlevel.com/
2. Navigate to Settings → AI Agents → Voice Agents
3. Find "Centered Assistant" agent
4. Click "Edit"
5. Under "Phone & Availability", select your Twilio phone number
6. Set business hours (Mon-Fri 8AM-6PM)
7. Save

#### Option B: Via API
```bash
curl -X PUT https://services.leadconnectorhq.com/voice-ai/agents/{AGENT_ID}/phone \
  -H "Authorization: Bearer pit-a041bdc6-f482-46c6-89b6-5daf5fef1ce2" \
  -H "Content-Type: application/json" \
  -d '{"phoneNumberId": "YOUR_PHONE_NUMBER_ID"}'
```

### Step 5: Test the Agent

Call the assigned phone number and test these scenarios:

#### Test 1: Business Information
- **Say:** "What's your address?" or "What services do you offer?"
- **Expected:** Agent provides clinic location and services

#### Test 2: Appointment Booking
- **Say:** "I'd like to book an appointment"
- **Expected:** Agent checks availability and books appointment

#### Test 3: Callback Request
- **Say:** "Can someone call me back?"
- **Expected:** Agent captures your info and creates callback task

#### Test 4: Voicemail (After Hours)
- **Say:** "I'd like to leave a message"
- **Expected:** Agent records and transcribes voicemail

### Step 6: Monitor Call Logs

View call logs and transcripts:

```bash
curl "https://centered-remits.onrender.com/api/voice-ai/centered/calls?agentId={AGENT_ID}"
```

## Custom Actions Reference

### 1. Get Business Info
**Endpoint:** `POST /api/voice-ai/actions/business-info`

**Triggers:**
- "where are you located"
- "what services do you offer"
- "tell me about"
- "how much does it cost"

**Parameters:**
- `query` (string) - What information is being requested

### 2. Check Availability
**Endpoint:** `POST /api/voice-ai/actions/check-availability`

**Triggers:**
- "book appointment"
- "schedule"
- "availability"
- "available times"

**Parameters:**
- `service_type` (string) - "therapy", "psychiatric_care", or "ketamine_therapy"
- `preferred_date` (string, optional) - YYYY-MM-DD format
- `preferred_time` (string, optional) - "morning", "afternoon", or "evening"

### 3. Book Appointment
**Endpoint:** `POST /api/voice-ai/actions/book-appointment`

**Triggers:**
- "yes book it"
- "confirm"
- "that works"

**Parameters:**
- `first_name` (string)
- `last_name` (string)
- `phone` (string)
- `email` (string)
- `service_type` (string)
- `appointment_date` (string) - YYYY-MM-DD
- `appointment_time` (string) - HH:MM (24-hour)
- `notes` (string, optional)

### 4. Request Callback
**Endpoint:** `POST /api/voice-ai/actions/request-callback`

**Triggers:**
- "call me back"
- "speak with someone"
- "talk to staff"

**Parameters:**
- `first_name` (string)
- `last_name` (string)
- `phone` (string)
- `reason` (string)
- `preferred_time` (string, optional)
- `urgency` (string, optional) - "low", "medium", "high"

### 5. Leave Voicemail
**Endpoint:** `POST /api/voice-ai/actions/voicemail`

**Triggers:**
- "leave message"
- "voicemail"
- "message for"

**Parameters:**
- `caller_name` (string)
- `phone` (string)
- `message` (string) - Transcribed message
- `staff_member` (string, optional) - Specific staff to reach

## Troubleshooting

### Agent Not Answering
1. Check phone number assignment in GHL dashboard
2. Verify agent status is "active"
3. Check business hours configuration

### Webhooks Failing
1. Verify `NEXT_PUBLIC_APP_URL` is correct
2. Check API endpoint logs in Render
3. Test webhooks manually: `curl -X POST {webhook_url} -d '{test_data}'`

### Knowledge Base Empty
1. Run `POST /api/firecrawl/scrape-centered` again
2. Check Firecrawl API key is valid
3. Verify centered.one is accessible

### Appointments Not Booking
1. Check calendars exist in Centered location
2. Verify GHL API token has calendar permissions
3. Review GHL dashboard for appointment requests

## API Endpoints

### Setup & Management
- `POST /api/voice-ai/centered/setup` - Create agent
- `GET /api/voice-ai/centered/status?agentId={id}` - Check status
- `GET /api/voice-ai/centered/calls?agentId={id}` - Get call logs

### Knowledge Base
- `POST /api/firecrawl/scrape-centered` - Scrape website
- `GET /api/voice-ai/knowledge` - View knowledge base
- `POST /api/voice-ai/knowledge` - Query knowledge base

### Custom Actions (Webhooks)
- `POST /api/voice-ai/actions/business-info`
- `POST /api/voice-ai/actions/check-availability`
- `POST /api/voice-ai/actions/book-appointment`
- `POST /api/voice-ai/actions/request-callback`
- `POST /api/voice-ai/actions/voicemail`

## Files Created

### Core Services
- `/lib/firecrawl/client.ts` - Firecrawl SDK client
- `/lib/firecrawl/centered-scraper.ts` - Website scraper & knowledge base
- `/lib/ghl/voice-ai-service.ts` - GHL Voice AI API wrapper
- `/lib/ghl/centered-voice-agent.ts` - Centered-specific agent setup

### API Routes
- `/app/api/firecrawl/scrape-centered/route.ts`
- `/app/api/voice-ai/knowledge/route.ts`
- `/app/api/voice-ai/centered/setup/route.ts`
- `/app/api/voice-ai/centered/status/route.ts`
- `/app/api/voice-ai/centered/calls/route.ts`
- `/app/api/voice-ai/actions/business-info/route.ts`
- `/app/api/voice-ai/actions/check-availability/route.ts`
- `/app/api/voice-ai/actions/book-appointment/route.ts`
- `/app/api/voice-ai/actions/request-callback/route.ts`
- `/app/api/voice-ai/actions/voicemail/route.ts`

## Next Steps

1. **Get Firecrawl API Key:** https://firecrawl.dev
2. **Populate Knowledge Base:** `POST /api/firecrawl/scrape-centered`
3. **Create Agent:** `POST /api/voice-ai/centered/setup`
4. **Assign Phone Number:** Via GHL dashboard
5. **Test:** Call the phone number
6. **Monitor:** Check call logs and adjust as needed

## Production Checklist

- [ ] Firecrawl API key added to Render environment
- [ ] Knowledge base populated
- [ ] Voice AI agent created
- [ ] Twilio phone number assigned
- [ ] All test scenarios passing
- [ ] Call logs visible and transcripts working
- [ ] SMS confirmations sending
- [ ] Callback tasks creating in GHL
- [ ] Staff notifications configured

## Support

- **Firecrawl:** https://docs.firecrawl.dev
- **GoHighLevel Voice AI:** https://help.gohighlevel.com/voice-ai
- **GHL API:** https://marketplace.gohighlevel.com/docs

---

**Created:** 2025-10-26  
**Status:** Ready for deployment  
**Estimated Setup Time:** 30 minutes
