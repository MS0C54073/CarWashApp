/**
 * Script to check and fix services table constraints
 * Run with: node backend/scripts/check-services-constraints.js
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAndFixConstraints() {
  console.log('🔍 Checking services table constraints...\n');

  try {
    // Check current constraints using raw SQL
    const { data: constraints, error: checkError } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT 
          conname as constraint_name,
          contype as constraint_type,
          pg_get_constraintdef(oid) as constraint_definition
        FROM pg_constraint
        WHERE conrelid = 'services'::regclass
        AND contype = 'c'
        ORDER BY conname;
      `
    });

    if (checkError) {
      console.log('⚠️  Could not check constraints via RPC. Using direct SQL approach...\n');
      console.log('📋 Please run the SQL migration file manually in Supabase SQL Editor:\n');
      console.log('   backend/migrations/fix-services-constraint-comprehensive.sql\n');
      return;
    }

    console.log('📋 Current constraints on services table:');
    if (constraints && constraints.length > 0) {
      constraints.forEach((constraint) => {
        console.log(`   - ${constraint.constraint_name}: ${constraint.constraint_definition}`);
      });
    } else {
      console.log('   No check constraints found.');
    }

    // Try to drop the problematic constraint
    console.log('\n🔧 Attempting to fix constraints...\n');

    const fixSQL = `
      -- Drop the restrictive constraint
      ALTER TABLE services DROP CONSTRAINT IF EXISTS services_name_check;
      
      -- Add proper constraint
      ALTER TABLE services DROP CONSTRAINT IF EXISTS services_name_not_empty;
      ALTER TABLE services 
      ADD CONSTRAINT services_name_not_empty 
      CHECK (LENGTH(TRIM(name)) > 0 AND LENGTH(name) <= 100);
    `;

    const { error: fixError } = await supabase.rpc('exec_sql', { sql: fixSQL });

    if (fixError) {
      console.log('❌ Could not fix constraints automatically.');
      console.log('📋 Please run this SQL in Supabase SQL Editor:\n');
      console.log(fixSQL);
      console.log('\n');
    } else {
      console.log('✅ Constraints fixed successfully!\n');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n📋 Please run the SQL migration manually in Supabase SQL Editor:\n');
    console.log('   backend/migrations/fix-services-constraint-comprehensive.sql\n');
  }
}

checkAndFixConstraints();
