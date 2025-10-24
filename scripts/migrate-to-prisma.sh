#!/bin/bash
# Migration script from Supabase to Prisma on Render
set -e
echo "Migrating from Supabase to Prisma"
npm install prisma @prisma/client --save
npx prisma generate
echo "✅ Migration Complete!"
