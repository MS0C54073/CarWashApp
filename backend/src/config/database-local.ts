import dotenv from 'dotenv';
dotenv.config();

import { testConnection } from './supabase';

/**
 * Database connection for local development
 * Automatically uses local Supabase if available, otherwise uses remote
 */
const connectDB = async (): Promise<void> => {
  try {
    // Check if we should use local Supabase
    const useLocal = process.env.USE_LOCAL_SUPABASE === 'true';
    
    if (useLocal) {
      // Update environment variables for local Supabase
      // These will be set when Supabase starts locally
      console.log('🔗 Connecting to local Supabase...');
    } else {
      console.log('🔗 Connecting to remote Supabase...');
    }

    const connected = await testConnection();
    if (!connected) {
      console.error('Failed to connect to Supabase');
      process.exit(1);
    }
  } catch (error) {
    console.error('Error connecting to Supabase:', error);
    process.exit(1);
  }
};

export default connectDB;
