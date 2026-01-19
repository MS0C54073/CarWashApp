import dotenv from 'dotenv';
// Load environment variables FIRST
dotenv.config();

import { readFileSync } from 'fs';
import { join } from 'path';
import { executeSQL, testConnection } from '../config/postgres';

/**
 * Automatically create all tables in Supabase using direct PostgreSQL connection
 */
const autoCreateTables = async () => {
  try {
    console.log('🚀 Starting automatic table creation...\n');

    // Test connection first
    console.log('🔗 Testing PostgreSQL connection...');
    const connected = await testConnection();
    
    if (!connected) {
      throw new Error('Failed to connect to PostgreSQL database');
    }

    console.log('\n📝 Reading SQL schema...');
    
    // Read SQL schema
    const schemaPath = join(__dirname, '../../supabase-schema.sql');
    const sql = readFileSync(schemaPath, 'utf-8');

    console.log('✅ SQL schema loaded\n');
    console.log('🔄 Executing migration...\n');

    // Execute the SQL
    // Split by semicolon but handle multi-line statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      // Skip empty statements and comments
      if (!statement || statement.startsWith('--')) continue;

      try {
        // Execute each statement
        await executeSQL(statement + ';');
        successCount++;
        
        // Show progress for important statements
        if (statement.toUpperCase().includes('CREATE TABLE')) {
          const tableName = statement.match(/CREATE TABLE.*?(\w+)/i)?.[1];
          if (tableName) {
            console.log(`✅ Created table: ${tableName}`);
          }
        } else if (statement.toUpperCase().includes('CREATE INDEX')) {
          const indexName = statement.match(/CREATE INDEX.*?(\w+)/i)?.[1];
          if (indexName) {
            console.log(`✅ Created index: ${indexName}`);
          }
        } else if (statement.toUpperCase().includes('CREATE TRIGGER')) {
          const triggerName = statement.match(/CREATE TRIGGER.*?(\w+)/i)?.[1];
          if (triggerName) {
            console.log(`✅ Created trigger: ${triggerName}`);
          }
        } else if (statement.toUpperCase().includes('CREATE FUNCTION')) {
          console.log(`✅ Created function: update_updated_at_column`);
        } else if (statement.toUpperCase().includes('CREATE EXTENSION')) {
          console.log(`✅ Enabled extension: uuid-ossp`);
        }
      } catch (error: any) {
        errorCount++;
        // Some errors are expected (e.g., "already exists")
        if (error.message.includes('already exists') || 
            error.message.includes('duplicate')) {
          // Silently skip - this is fine
        } else {
          console.warn(`⚠️  Statement ${i + 1} warning: ${error.message.substring(0, 100)}`);
        }
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 Migration Summary:');
    console.log('='.repeat(60));
    console.log(`✅ Successful: ${successCount} statements`);
    if (errorCount > 0) {
      console.log(`⚠️  Warnings: ${errorCount} (may include "already exists" messages)`);
    }
    console.log('='.repeat(60));

    // Verify tables were created
    console.log('\n🔍 Verifying tables...\n');
    const tables = ['users', 'vehicles', 'services', 'bookings', 'payments'];
    const existingTables: string[] = [];

    for (const table of tables) {
      try {
        await executeSQL(`SELECT 1 FROM ${table} LIMIT 1;`);
        existingTables.push(table);
        console.log(`✅ Table exists: ${table}`);
      } catch (error: any) {
        if (error.message.includes('does not exist')) {
          console.log(`❌ Table missing: ${table}`);
        }
      }
    }

    if (existingTables.length === tables.length) {
      console.log('\n🎉 SUCCESS! All tables created successfully!');
      console.log('✅ Your Supabase database is ready to use.\n');
    } else {
      console.log(`\n⚠️  Only ${existingTables.length}/${tables.length} tables found.`);
      console.log('💡 Check the error messages above for details.\n');
    }

  } catch (error: any) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('\n💡 Make sure:');
    console.error('   1. DATABASE_URL is set in .env file');
    console.error('   2. Your password in the connection string is correct');
    console.error('   3. Your Supabase project is active\n');
    process.exit(1);
  }
};

// Run migration if called directly
if (require.main === module) {
  autoCreateTables().then(() => {
    process.exit(0);
  }).catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}

export default autoCreateTables;
