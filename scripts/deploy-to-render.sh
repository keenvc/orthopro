#!/bin/bash
# Deployment script for Render
# This script prepares the application for Render deployment

set -e

echo "============================================"
echo "Preparing Deployment to Render"
echo "============================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check prerequisites
echo "🔍 Checking prerequisites..."

if ! command -v git &> /dev/null; then
    echo -e "${RED}❌ Git is not installed${NC}"
    exit 1
fi

if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Prerequisites met${NC}"
echo ""

# Check if DATABASE_URL is set (for testing)
if [ -z "$DATABASE_URL" ]; then
    echo -e "${YELLOW}⚠️  DATABASE_URL not set (will be configured in Render)${NC}"
else
    echo -e "${GREEN}✅ DATABASE_URL is set${NC}"
fi

echo ""
echo "📦 Installing dependencies..."
npm install

echo ""
echo "⚙️  Generating Prisma Client..."
npx prisma generate

echo ""
echo "🏗️  Testing build..."
npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Build successful!${NC}"
else
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi

echo ""
echo "============================================"
echo "✅ Ready for Render Deployment!"
echo "============================================"
echo ""
echo "Deployment Checklist:"
echo ""
echo "□ Push code to GitHub"
echo "  git add ."
echo "  git commit -m 'Prepare for Render deployment'"
echo "  git push origin main"
echo ""
echo "□ Create Render PostgreSQL database"
echo "  - Go to render.com → New → PostgreSQL"
echo "  - Name: centered-remits-db"
echo "  - Copy connection string"
echo ""
echo "□ Create Render Web Service"
echo "  - Go to render.com → New → Web Service"
echo "  - Connect GitHub repo"
echo "  - Build Command: npm install && npx prisma generate && npm run build"
echo "  - Start Command: npm start"
echo ""
echo "□ Set Environment Variables in Render"
echo "  DATABASE_URL=<from_postgresql>"
echo "  INBOX_HEALTH_API_KEY=<your_key>"
echo "  NEXT_PUBLIC_APP_URL=https://centered.advancedcare.co"
echo "  NODE_ENV=production"
echo ""
echo "□ Run database migrations"
echo "  npx prisma db push"
echo ""
echo "□ Add custom domain"
echo "  centered.advancedcare.co"
echo ""
