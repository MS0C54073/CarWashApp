import dotenv from 'dotenv';
dotenv.config();

import { readFileSync } from 'fs';
import { join } from 'path';
import { Pool } from 'pg';

/**
 * Initialize database - automatically creates all tables
 * This runs on backend startup if tables don't exist
 */
export const initDatabase = async (): Promise<boolean> => {
  try {
    const databaseUrl = process.env.DATABASE_URL;
    
    // Only auto-create if DATABASE_URL is provided
    if (!databaseUrl || !databaseUrl.includes('postgresql://')) {
      console.log('ℹ️  DATABASE_URL not set - skipping auto table creation');
      console.log('💡 Tables need to be created manually or via migration script');
      return false;
    }

    console.log('🔄 Checking database tables...');

    const pool = new Pool({
      connectionString: databaseUrl,
      ssl: { rejectUnauthorized: false },
    });

    // Check if tables exist
    const tables = ['users', 'vehicles', 'services', 'bookings', 'payments'];
    const missingTables: string[] = [];

    for (const table of tables) {
      try {
        await pool.query(`SELECT 1 FROM ${table} LIMIT 1;`);
      } catch (error: any) {
        if (error.code === '42P01') { // Table doesn't exist
          missingTables.push(table);
        }
      }
    }

    if (missingTables.length === 0) {
      console.log('✅ All tables exist - database ready');
      await pool.end();
      return true;
    }

    console.log(`📋 Found ${missingTables.length} missing tables - creating...\n`);

    // Read and execute SQL schema
    const schemaPath = join(__dirname, '../../supabase-schema.sql');
    const sql = readFileSync(schemaPath, 'utf-8');

    console.log('🔄 Executing migration...');
    await pool.query(sql);

    console.log('✅ Tables created successfully!\n');

    // Verify
    for (const table of tables) {
      try {
        await pool.query(`SELECT 1 FROM ${table} LIMIT 1;`);
        console.log(`✅ ${table}`);
      } catch (error) {
        console.log(`❌ ${table} - creation failed`);
      }
    }

    await pool.end();
    console.log('\n🎉 Database initialization complete!');
    return true;

  } catch (error: any) {
    if (error.message.includes('already exists')) {
      // Tables already exist - this is fine
      console.log('✅ Database tables already exist');
      return true;
    }
    console.error('❌ Database initialization error:', error.message);
    return false;
  }
};
