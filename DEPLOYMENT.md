# Deployment Guide for centered.advancedcare.co

This Next.js application is configured for deployment on Render with PostgreSQL.

---

## Quick Deploy (15 minutes)

### Prerequisites
- Render account ([sign up](https://render.com))
- GitHub account
- DNS access for advancedcare.co

### Steps

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial deployment"
   git remote add origin https://github.com/YOUR_USERNAME/centered-remits.git
   git push -u origin main
   ```

2. **Deploy using render.yaml**
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click **New** → **Blueprint**
   - Connect your GitHub repo
   - Render will auto-create database + web service

3. **Set secrets in Render**
   ```
   INBOX_HEALTH_API_KEY=<your_key>
   GROQ_API_KEY=<your_key>
   ```

4. **Run database migrations**
   ```bash
   # Get External Database URL from Render dashboard
   psql <EXTERNAL_URL>
   
   # Run schema files
   \i /path/to/remits_database_schema.sql
   \i /path/to/supabase-schema.sql
   \q
   ```

5. **Add custom domain**
   - Render Dashboard → Your Service → Settings → Custom Domains
   - Add: `centered.advancedcare.co`
   - Update DNS with CNAME record provided

---

## Manual Deployment

If not using render.yaml, follow these steps:

### 1. Create PostgreSQL Database
- Dashboard → New → PostgreSQL
- Name: `centered-remits-db`
- Plan: Starter ($7/mo)
- Copy Internal Database URL

### 2. Create Web Service
- Dashboard → New → Web Service
- Connect GitHub repo
- Configure:
  - **Build Command**: `npm install && npx prisma generate && npm run build`
  - **Start Command**: `npm start`
  - **Environment Variables**: See section below

### 3. Environment Variables
```env
DATABASE_URL=<internal_db_url>
INBOX_HEALTH_API_KEY=<from_inbox_health>
NEXT_PUBLIC_INBOX_HEALTH_API_URL=https://api.demo.inboxhealth.com/partner/v2
NEXT_PUBLIC_APP_URL=https://centered.advancedcare.co
NODE_ENV=production
GROQ_API_KEY=<from_groq>
```

---

## Architecture

```
┌─────────────────────────────────────┐
│   centered.advancedcare.co          │
│   (Custom Domain + SSL)             │
└─────────────┬───────────────────────┘
              │
┌─────────────▼───────────────────────┐
│   Render Web Service                │
│   • Next.js 14                      │
│   • Node.js 20                      │
│   • Prisma ORM                      │
│   • API Routes                      │
└─────────────┬───────────────────────┘
              │
┌─────────────▼───────────────────────┐
│   Render PostgreSQL                 │
│   • 11 tables                       │
│   • Connection pooling              │
│   • Automated backups               │
└─────────────────────────────────────┘
```

---

## Database Schema

**Tables:**
- `patients` - Patient records
- `invoices` - Medical invoices
- `invoice_line_items` - Invoice details
- `payments` - Payment records
- `invoice_payments` - Payment allocations
- `patient_plans` - Insurance plans
- `practices` - Medical practices
- `doctors` - Healthcare providers
- `webhook_events` - Inbox Health webhooks
- `remittance_documents` - ERA documents
- `remittance_checks` - Check/EFT records
- `remittance_claims` - Insurance claims
- `remittance_claim_lines` - Claim line items
- `remittance_adjustments` - Claim adjustments

---

## Local Development

```bash
# Install dependencies
npm install

# Set up database URL
echo "DATABASE_URL=postgresql://..." > .env

# Generate Prisma client
npx prisma generate

# Run migrations (optional)
npx prisma db push

# Start dev server
npm run dev
```

Visit http://localhost:3000

---

## Scripts

- `npm run dev` - Development server
- `npm run build` - Production build
- `npm start` - Production server
- `npx prisma studio` - Database GUI
- `npx prisma generate` - Generate Prisma Client
- `npx prisma db push` - Sync schema to database

---

## Monitoring

**Render provides:**
- Real-time logs
- CPU/Memory metrics
- Request latency
- Error rates
- Database connections

Access via: Dashboard → Your Service → Metrics/Logs

---

## Troubleshooting

### Build fails
```bash
# Validate Prisma schema
npx prisma validate

# Test build locally
npm run build
```

### Database connection error
- Verify DATABASE_URL is set
- Use Internal Database URL (not External)
- Check database is running
- Verify same region for app & database

### App crashes on start
- Check logs in Render dashboard
- Verify all env variables are set
- Ensure Prisma client is generated

---

## Backup & Recovery

**Automated backups:**
- Render provides daily backups (7-day retention on Starter)

**Manual backup:**
```bash
# Export database
pg_dump $DATABASE_URL > backup.sql

# Restore
psql $DATABASE_URL < backup.sql
```

---

## Scaling

**Vertical scaling** (more resources):
- Upgrade to Standard plan ($25/mo for web, $20/mo for DB)
- More RAM, better performance

**Horizontal scaling** (more instances):
- Available on Professional plans
- Auto-scaling based on traffic

---

## Security

✅ **Implemented:**
- HTTPS/SSL via Let's Encrypt
- Environment variables for secrets
- Database connection encryption
- CORS configuration

⚠️ **TODO:**
- Implement authentication (NextAuth.js recommended)
- Add rate limiting
- Set up monitoring/alerts
- Configure firewall rules

---

## Cost Estimate

| Service | Plan | Cost |
|---------|------|------|
| Web Service | Starter | $7/mo |
| PostgreSQL | Starter | $7/mo |
| **Total** | | **$14/mo** |

*Prices as of 2024. Check Render pricing for current rates.*

---

## Support

- **Full Guide**: `/root/RENDER_DEPLOYMENT_GUIDE.md`
- **Quick Start**: `/root/RENDER_QUICK_START.md`
- **Render Docs**: https://render.com/docs
- **Prisma Docs**: https://www.prisma.io/docs

---

## Project Structure

```
inbox-health-dashboard/
├── app/                    # Next.js pages & API routes
├── lib/
│   ├── database.ts        # Prisma client (NEW)
│   └── supabase.ts        # Legacy (remove after migration)
├── prisma/
│   └── schema.prisma      # Database schema
├── public/                # Static assets
├── scripts/
│   └── migrate-to-prisma.sh
├── render.yaml            # Render configuration
├── package.json
└── DEPLOYMENT.md          # This file
```

---

**Last Updated**: 2025-10-24  
**Target Domain**: centered.advancedcare.co  
**Platform**: Render  
**Framework**: Next.js 14 + Prisma
