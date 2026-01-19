import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { join } from 'path';
// import axios from 'axios'; // Commented out - not used in this migration

// Load environment variables first
dotenv.config();

/**
 * Migration script using Supabase REST API
 * This requires the service_role key for direct SQL execution
 * 
 * Usage: SUPABASE_SERVICE_ROLE_KEY=your_key npm run migrate:rest
 */
const runMigration = async () => {
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      console.error('❌ Missing required environment variables:');
      console.error('   SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
      console.error('\n💡 Get your service_role key from:');
      console.error('   Supabase Dashboard → Settings → API → service_role key');
      process.exit(1);
    }

    console.log('🚀 Starting Supabase migration via REST API...\n');
    console.log(`📍 Connecting to: ${supabaseUrl}\n`);

    // Read the SQL schema file
    const schemaPath = join(__dirname, '../../supabase-schema.sql');
    const sql = readFileSync(schemaPath, 'utf-8');

    // Execute SQL using Supabase REST API
    // Note: This requires axios or fetch. For now, using manual migration.
    console.log('⚠️  Automatic migration via REST API requires axios or fetch');
    console.log('💡 Please run the SQL manually in Supabase SQL Editor');
    console.log(`   File: ${schemaPath}`);
    console.log('\n📋 SQL Content:');
    console.log('='.repeat(60));
    console.log(sql.substring(0, 500) + '...');
    console.log('='.repeat(60));
    console.log('\n✅ Please copy the full SQL from the file and run it in Supabase SQL Editor');
    
    // Uncomment below when axios is available:
    /*
    const response = await axios.post(
      `${supabaseUrl}/rest/v1/rpc/exec_sql`,
      { query: sql },
      {
        headers: {
          'apikey': serviceRoleKey,
          'Authorization': `Bearer ${serviceRoleKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.status === 200 || response.status === 201) {
      console.log('✅ Migration completed successfully!');
      console.log('📊 Tables created in Supabase');
    } else {
      console.warn('⚠️  Unexpected response:', response.status);
    }
    */

  } catch (error: any) {
    if (error.response) {
      console.error('❌ Migration failed:', error.response.data);
      console.error('Status:', error.response.status);
    } else if (error.request) {
      console.error('❌ No response from Supabase');
      console.error('💡 Make sure your SUPABASE_URL is correct');
    } else {
      console.error('❌ Error:', error.message);
    }
    
    console.error('\n📋 Alternative: Run SQL manually in Supabase SQL Editor');
    console.error('   File: backend/supabase-schema.sql');
    process.exit(1);
  }
};

// Run migration if called directly
if (require.main === module) {
  runMigration();
}

export default runMigration;
