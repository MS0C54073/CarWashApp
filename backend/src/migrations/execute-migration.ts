import dotenv from 'dotenv';
// Load environment variables FIRST before importing anything that uses them
dotenv.config();

import { readFileSync } from 'fs';
import { join } from 'path';
import { supabase } from '../config/supabase';

/**
 * Execute migration by running SQL statements directly
 * This uses Supabase's PostgREST API to execute DDL statements
 */
const executeMigration = async () => {
  try {
    console.log('🚀 Executing Supabase Migration...\n');

    const supabaseUrl = process.env.SUPABASE_URL;
    if (!supabaseUrl) {
      throw new Error('SUPABASE_URL not found');
    }

    console.log(`📍 Connecting to: ${supabaseUrl}\n`);

    // Read SQL schema
    const schemaPath = join(__dirname, '../../supabase-schema.sql');
    const sql = readFileSync(schemaPath, 'utf-8');

    console.log('📝 SQL schema loaded\n');
    console.log('⚠️  Supabase REST API does not support direct SQL execution for security reasons.');
    console.log('📋 You need to run the SQL manually in Supabase SQL Editor.\n');

    console.log('='.repeat(70));
    console.log('STEP-BY-STEP INSTRUCTIONS:');
    console.log('='.repeat(70));
    console.log('\n1. Go to: https://lbtzrworenlwecbktlpq.supabase.co');
    console.log('2. Click "SQL Editor" in the left sidebar');
    console.log('3. Click "New Query" button');
    console.log('4. Copy the SQL below (or from backend/supabase-schema.sql)');
    console.log('5. Paste into the SQL Editor');
    console.log('6. Click "Run" button (or press Ctrl+Enter)\n');

    console.log('='.repeat(70));
    console.log('SQL TO EXECUTE:');
    console.log('='.repeat(70));
    console.log('\n' + sql + '\n');
    console.log('='.repeat(70));

    // Try to verify tables after a delay
    console.log('\n⏳ After running the SQL, wait 5 seconds...\n');
    console.log('💡 Then run: npm run migrate (to verify tables were created)\n');

    // Check current table status
    console.log('🔍 Current database status:\n');
    await checkTables();

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

const checkTables = async () => {
  const tables = ['users', 'vehicles', 'services', 'bookings', 'payments'];
  const existing: string[] = [];
  const missing: string[] = [];

  for (const table of tables) {
    try {
      const { error } = await supabase.from(table).select('id').limit(0);
      if (error && (error.code === 'PGRST116' || error.code === '42P01')) {
        missing.push(table);
      } else if (!error) {
        existing.push(table);
      } else {
        missing.push(table);
      }
    } catch (err) {
      missing.push(table);
    }
  }

  if (existing.length > 0) {
    console.log('✅ Existing tables:');
    existing.forEach(t => console.log(`   ✓ ${t}`));
    console.log();
  }

  if (missing.length > 0) {
    console.log('❌ Missing tables (need to be created):');
    missing.forEach(t => console.log(`   ✗ ${t}`));
    console.log();
  }

  if (missing.length === 0 && existing.length === tables.length) {
    console.log('✅ All tables exist! Database is ready.\n');
  } else {
    console.log('📝 Run the SQL above in Supabase SQL Editor to create missing tables.\n');
  }
};

if (require.main === module) {
  executeMigration();
}

export default executeMigration;
