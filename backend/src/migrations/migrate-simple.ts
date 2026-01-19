import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { join } from 'path';

// Load environment variables first
dotenv.config();

import { supabase } from '../config/supabase';

/**
 * Simple migration that creates tables one by one using Supabase client
 * This works with the anon key but requires tables to be created via SQL Editor first
 * 
 * This script validates the schema and provides instructions
 */
const runMigration = async () => {
  try {
    console.log('🚀 Supabase Migration Helper\n');
    console.log('📍 This script will help you set up your Supabase database\n');

    const schemaPath = join(__dirname, '../../supabase-schema.sql');
    const sql = readFileSync(schemaPath, 'utf-8');

    console.log('📋 SQL Schema loaded from: supabase-schema.sql\n');
    console.log('=' .repeat(60));
    console.log('AUTOMATIC MIGRATION OPTIONS:\n');
    console.log('Option 1: Use Supabase CLI (Recommended)');
    console.log('  1. Install: npm install -g supabase');
    console.log('  2. Login: supabase login');
    console.log('  3. Link: supabase link --project-ref your-project-ref');
    console.log('  4. Migrate: supabase db push\n');

    console.log('Option 2: Use Supabase Dashboard');
    console.log('  1. Go to: https://lbtzrworenlwecbktlpq.supabase.co');
    console.log('  2. Navigate to: SQL Editor');
    console.log('  3. Copy SQL from: backend/supabase-schema.sql');
    console.log('  4. Paste and click "Run"\n');

    console.log('Option 3: Use REST API (requires service_role key)');
    console.log('  1. Get service_role key from Supabase Dashboard → Settings → API');
    console.log('  2. Set env: SUPABASE_SERVICE_ROLE_KEY=your_key');
    console.log('  3. Run: npm run migrate:rest\n');

    console.log('=' .repeat(60));
    console.log('\n🔍 Checking existing tables...\n');

    // Check which tables exist
    const tables = ['users', 'vehicles', 'services', 'bookings', 'payments'];
    const existingTables: string[] = [];
    const missingTables: string[] = [];

    for (const table of tables) {
      try {
        const { error } = await supabase.from(table).select('id').limit(0);
        if (error && (error.code === 'PGRST116' || error.code === '42P01')) {
          missingTables.push(table);
        } else {
          existingTables.push(table);
        }
      } catch (err) {
        missingTables.push(table);
      }
    }

    if (existingTables.length > 0) {
      console.log('✅ Existing tables:');
      existingTables.forEach(table => console.log(`   - ${table}`));
      console.log();
    }

    if (missingTables.length > 0) {
      console.log('❌ Missing tables:');
      missingTables.forEach(table => console.log(`   - ${table}`));
      console.log();
      console.log('📝 To create missing tables, use one of the options above.\n');
    } else {
      console.log('✅ All tables exist! Database is ready.\n');
    }

    // Test connection
    console.log('🔗 Testing Supabase connection...');
    const { error: testError } = await supabase.from('users').select('id').limit(0);
    
    if (testError && (testError.code === 'PGRST116' || testError.code === '42P01')) {
      console.log('⚠️  Connection OK, but tables need to be created\n');
    } else if (testError) {
      console.log('❌ Connection error:', testError.message, '\n');
    } else {
      console.log('✅ Connection successful!\n');
    }

    console.log('=' .repeat(60));
    console.log('\n📄 SQL Schema Preview (first 500 chars):\n');
    console.log(sql.substring(0, 500) + '...\n');
    console.log('=' .repeat(60));

  } catch (error: any) {
    console.error('❌ Migration helper error:', error.message);
    process.exit(1);
  }
};

// Run migration if called directly
if (require.main === module) {
  runMigration();
}

export default runMigration;
