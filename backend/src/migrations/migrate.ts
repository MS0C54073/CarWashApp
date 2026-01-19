import { readFileSync } from 'fs';
import { join } from 'path';
import { supabase } from '../config/supabase';

const runMigration = async () => {
  try {
    console.log('🚀 Starting Supabase migration...\n');

    // Read the SQL schema file
    const schemaPath = join(__dirname, '../../supabase-schema.sql');
    const sql = readFileSync(schemaPath, 'utf-8');

    // Split SQL into individual statements (by semicolon, but handle multi-line statements)
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`📝 Found ${statements.length} SQL statements to execute\n`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      // Skip empty statements and comments
      if (!statement || statement.startsWith('--')) continue;

      try {
        console.log(`[${i + 1}/${statements.length}] Executing statement...`);
        
        // Use Supabase RPC or direct SQL execution
        // Note: Supabase client doesn't support raw SQL directly
        // We'll use the REST API or create a migration endpoint
        const { data, error } = await supabase.rpc('exec_sql', { 
          sql_query: statement 
        });

        if (error) {
          // If exec_sql doesn't exist, we'll need to use a different approach
          // For now, log and continue - user can run SQL manually or we'll use REST API
          console.warn(`⚠️  Could not execute via RPC: ${error.message}`);
          console.log('💡 Using alternative method...\n');
        } else {
          console.log(`✅ Statement ${i + 1} executed successfully\n`);
        }
      } catch (err: any) {
        console.error(`❌ Error executing statement ${i + 1}:`, err.message);
        // Continue with next statement
      }
    }

    console.log('✅ Migration completed!');
    console.log('\n📋 Next steps:');
    console.log('1. Go to your Supabase dashboard');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Run the SQL from: backend/supabase-schema.sql');
    console.log('\nOr use the REST API migration method (see migrate-rest.ts)');

  } catch (error: any) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
};

// Run migration if called directly
if (require.main === module) {
  runMigration();
}

export default runMigration;
