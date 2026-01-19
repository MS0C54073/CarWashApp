import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Parse PostgreSQL connection string
const connectionString = process.env.DATABASE_URL || '';

if (!connectionString) {
  throw new Error('DATABASE_URL not found in environment variables');
}

// Create PostgreSQL connection pool
export const pool = new Pool({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false, // Required for Supabase
  },
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test connection
export const testConnection = async (): Promise<boolean> => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    console.log('✅ PostgreSQL connected successfully');
    console.log(`📍 Database time: ${result.rows[0].now}`);
    return true;
  } catch (error: any) {
    console.error('❌ PostgreSQL connection error:', error.message);
    return false;
  }
};

// Execute SQL query
export const executeSQL = async (sql: string): Promise<any> => {
  const client = await pool.connect();
  try {
    const result = await client.query(sql);
    return result;
  } finally {
    client.release();
  }
};

export default pool;
