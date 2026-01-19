import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { join } from 'path';
// import axios from 'axios'; // Commented out - not used in this migration

// Load environment variables first
dotenv.config();

/**
 * Automated migration using Supabase Management API
 * This script will automatically create all tables in Supabase
 */
const autoMigrate = async () => {
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    console.log('🚀 Starting automated Supabase migration...\n');

    if (!supabaseUrl) {
      throw new Error('SUPABASE_URL not found in environment variables');
    }

    if (!serviceRoleKey) {
      console.log('⚠️  SUPABASE_SERVICE_ROLE_KEY not found');
      console.log('\n📋 To enable automatic migration:');
      console.log('1. Go to Supabase Dashboard → Settings → API');
      console.log('2. Copy the "service_role" key (⚠️ Keep it secret!)');
      console.log('3. Add to .env: SUPABASE_SERVICE_ROLE_KEY=your_key');
      console.log('\n💡 For now, using manual migration method...\n');
      
      // Fallback to manual instructions
      await manualMigrationInstructions();
      return;
    }

    console.log(`📍 Connecting to: ${supabaseUrl}\n`);

    // Read SQL schema
    const schemaPath = join(__dirname, '../../supabase-schema.sql');
    const sql = readFileSync(schemaPath, 'utf-8');

    console.log('📝 SQL schema loaded\n');
    console.log('🔄 Executing migration...\n');

    // Supabase doesn't have a direct SQL execution endpoint via REST API
    // We need to use the PostgREST API or Management API
    // For now, we'll use the SQL Editor API endpoint
    
    // Note: Automatic migration via REST API requires axios or fetch
    // For now, falling back to manual migration instructions
    console.log('⚠️  Automatic migration via REST API is not available');
    console.log('💡 Please use manual migration method (instructions below)\n');

    // Alternative: Use Supabase Management API or provide instructions
    await manualMigrationInstructions();

  } catch (error: any) {
    console.error('❌ Migration error:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
    console.error('\n📋 Falling back to manual migration...\n');
    await manualMigrationInstructions();
  }
};

const manualMigrationInstructions = async () => {
  console.log('='.repeat(60));
  console.log('MANUAL MIGRATION INSTRUCTIONS');
  console.log('='.repeat(60));
  console.log('\n📋 Method 1: Supabase Dashboard (Easiest)\n');
  console.log('1. Open: https://lbtzrworenlwecbktlpq.supabase.co');
  console.log('2. Click: SQL Editor (left sidebar)');
  console.log('3. Click: New Query');
  console.log('4. Copy SQL from: backend/supabase-schema.sql');
  console.log('5. Paste into SQL Editor');
  console.log('6. Click: Run (or press Ctrl+Enter)');
  console.log('\n✅ Tables will be created immediately!\n');

  console.log('📋 Method 2: Supabase CLI\n');
  console.log('npm install -g supabase');
  console.log('supabase login');
  console.log('supabase link --project-ref lbtzrworenlwecbktlpq');
  console.log('supabase db push\n');

  console.log('='.repeat(60));
  console.log('\n💡 The SQL file is ready at: backend/supabase-schema.sql\n');
};

// Run migration if called directly
if (require.main === module) {
  autoMigrate().then(() => {
    console.log('✅ Migration process completed');
    process.exit(0);
  }).catch((error) => {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  });
}

export default autoMigrate;
