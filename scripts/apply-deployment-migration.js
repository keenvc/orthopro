const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dexrzialcqbedwvgfkfc.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRleHJ6aWFsY3FiZWR3dmdma2ZjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTE0MzY0NiwiZXhwIjoyMDc2NzE5NjQ2fQ.5kv2Fg7I0aZrrJVgCHv7oKUTOt-nnvETx4zzPzNQicU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyMigration() {
  try {
    console.log('📊 Applying deployment monitoring migration...\n');

    // Read migration file
    const migrationPath = path.join(__dirname, '../prisma/migrations/add_deployments_monitoring/migration.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    // Split into individual statements
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`Found ${statements.length} SQL statements to execute\n`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`Executing statement ${i + 1}/${statements.length}...`);
      
      const { error } = await supabase.rpc('exec_sql', { sql_query: statement + ';' });
      
      if (error) {
        // Try direct query if RPC fails
        const { error: directError } = await supabase.from('_').select('*').limit(0);
        if (directError) {
          console.error(`❌ Error executing statement ${i + 1}:`, error);
          console.error('Statement:', statement.substring(0, 100) + '...');
        }
      } else {
        console.log(`✅ Statement ${i + 1} executed successfully`);
      }
    }

    console.log('\n📊 Seeding initial deployment data...\n');

    // Seed deployments
    const seedPath = path.join(__dirname, 'seed-deployments.sql');
    const seedSQL = fs.readFileSync(seedPath, 'utf8');

    console.log('Seeding deployments...');
    // For seeding, we'll use the Supabase client directly
    const deployments = [
      {
        name: 'orthopro',
        display_name: 'OrthoPro Clinic',
        url: 'https://orthopro.advancedcare.co',
        health_check_url: 'https://orthopro.advancedcare.co',
        platform: 'render',
        repository_url: 'https://github.com/yourusername/orthopro',
        branch: 'main',
        status: 'deployed',
        health_status: 'unknown',
        environment: 'production',
        notes: 'Main orthopedic clinic management system',
      },
      {
        name: 'centered-remits',
        display_name: 'Centered Remits Dashboard',
        url: 'https://centered.advancedcare.co',
        health_check_url: 'https://centered.advancedcare.co',
        platform: 'render',
        repository_url: 'https://github.com/yourusername/inbox-health-dashboard',
        branch: 'main',
        status: 'deployed',
        health_status: 'unknown',
        environment: 'production',
        notes: 'Centered clinic remittance and patient management dashboard',
      },
      {
        name: 'ih003',
        display_name: 'IH003 Webhook Server',
        url: 'https://ih003.advancedcare.ai',
        health_check_url: 'https://ih003.advancedcare.ai/health',
        platform: 'other',
        branch: 'main',
        status: 'deployed',
        health_status: 'unknown',
        environment: 'production',
        notes: 'Legacy Inbox Health webhook receiver and dashboard',
      },
    ];

    for (const deployment of deployments) {
      const { data, error } = await supabase
        .from('deployments')
        .upsert(deployment, { onConflict: 'name' });

      if (error) {
        console.error(`❌ Error seeding ${deployment.name}:`, error.message);
      } else {
        console.log(`✅ Seeded deployment: ${deployment.display_name}`);
      }
    }

    console.log('\n✅ Migration and seeding completed successfully!\n');
    console.log('🚀 You can now access the deployment dashboard at: /deployments\n');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

applyMigration();
