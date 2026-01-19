/**
 * Run OAuth and Phone Auth Migration
 * This script runs the database migration to add OAuth and phone auth support
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

if (!supabaseKey) {
  console.error('❌ Error: SUPABASE_ANON_KEY or SUPABASE_SERVICE_ROLE_KEY not found in environment');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  console.log('🔄 Running OAuth and Phone Auth migration...\n');

  try {
    // Read migration SQL file
    const migrationPath = path.join(__dirname, '../scripts/migrate-oauth-phone.sql');
    const sql = fs.readFileSync(migrationPath, 'utf-8');

    // Execute migration using Supabase RPC (if available) or direct SQL
    // Note: Supabase doesn't support direct SQL execution via REST API
    // So we'll execute each statement separately

    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('COMMENT'));

    console.log(`📝 Found ${statements.length} SQL statements to execute\n`);

    // For now, we'll provide instructions
    console.log('⚠️  Supabase REST API does not support direct SQL execution.');
    console.log('📋 Please run the migration manually:\n');
    console.log('1. Open Supabase Studio: http://localhost:54326');
    console.log('2. Go to SQL Editor');
    console.log('3. Copy and paste the contents of: backend/scripts/migrate-oauth-phone.sql');
    console.log('4. Click Run\n');

    console.log('📄 Migration file location:');
    console.log(`   ${migrationPath}\n`);

    console.log('✅ Migration instructions provided');
    console.log('💡 After running the migration, restart your backend server\n');

  } catch (error) {
    console.error('❌ Migration error:', error);
    process.exit(1);
  }
}

runMigration();
