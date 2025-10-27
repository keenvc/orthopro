# OrthoPro

A comprehensive orthopedic practice management system built with Next.js, Prisma, and PostgreSQL.

## Features

- **Patient Management** - Complete patient records and demographics
- **Invoice Management** - Create and track patient invoices
- **Payment Processing** - Square payment integration
- **Remittance Processing** - 835 EDI remittance advice parsing
- **Insurance Verification** - Eligibility checking via Stedi API
- **Clinical Notes** - Patient chart notes and documentation
- **Email Communications** - Automated invoice delivery via MXRoute
- **SMS Notifications** - Twilio integration for text messaging
- **Webhook Support** - Real-time event processing

## Tech Stack

- **Framework:** Next.js 14.2.0 with React 18
- **Database:** PostgreSQL with Prisma ORM
- **Styling:** Tailwind CSS
- **Payments:** Square API
- **Email:** MXRoute SMTP
- **SMS:** Twilio API
- **APIs:** Inbox Health, Stedi, Groq LLM

## Deployment

Deployed on Render.com:
- **Production URL:** https://orthopro.advancedcare.co
- **Database:** Render PostgreSQL (oregon region)

## Development

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Run database migrations
npx prisma migrate dev

# Generate Prisma client
npx prisma generate

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Environment Variables

Required environment variables:

```env
DATABASE_URL=<postgresql-url>
NEXT_PUBLIC_APP_URL=https://orthopro.advancedcare.co
CLINIC_NAME=OrthoPro
MXROUTE_EMAIL=orthopro@advancedcare.co
MXROUTE_PASSWORD=<password>
MXROUTE_SMTP_HOST=heracles.mxrouting.net
MXROUTE_SMTP_PORT=587
INBOX_HEALTH_API_KEY=<key>
GROQ_API_KEY=<key>
SQUARE_ACCESS_TOKEN=<token>
SQUARE_LOCATION_ID=<location>
```

## License

Proprietary - All Rights Reserved
