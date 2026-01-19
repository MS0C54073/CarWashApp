import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Ensure env vars are loaded
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

// Better error handling for missing env vars
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables:');
  console.error(`   SUPABASE_URL: ${supabaseUrl ? '✅ set' : '❌ missing'}`);
  console.error(`   SUPABASE_ANON_KEY: ${supabaseAnonKey ? '✅ set' : '❌ missing'}`);
  console.error('\n💡 To fix this:');
  console.error('1. Create a `.env` file in the `backend` directory');
  console.error('2. Add the following variables:');
  console.error('   SUPABASE_URL=your_supabase_url');
  console.error('   SUPABASE_ANON_KEY=your_supabase_anon_key');
  console.error('\n📋 Get these from:');
  console.error('   Supabase Dashboard → Settings → API');
  console.error('   - Project URL → SUPABASE_URL');
  console.error('   - anon/public key → SUPABASE_ANON_KEY');
  throw new Error('Missing Supabase environment variables');
}

const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

// Validate URL format
if (!supabaseUrl.startsWith('http://') && !supabaseUrl.startsWith('https://')) {
  console.error('❌ Invalid SUPABASE_URL format. It should start with http:// or https://');
  throw new Error('Invalid SUPABASE_URL format');
}

export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Test connection
export const testConnection = async (): Promise<boolean> => {
  try {
    console.log('🔄 Testing Supabase connection...');
    console.log(`📍 URL: ${supabaseUrl.replace(/\/$/, '')}`);

    // Simple connection test - just verify we can reach Supabase
    const { error } = await supabase.from('users').select('id').limit(0);

    // PGRST116 = table doesn't exist (expected if tables not created yet)
    // 42P01 = relation does not exist (PostgreSQL error code)
    // These are expected if tables haven't been created yet
    if (error) {
      if (error.code === 'PGRST116' || error.code === '42P01') {
        console.log('⚠️  Tables not created yet (this is OK if you haven\'t run migrations)');
        console.log('✅ Supabase connection successful!');
        console.log(`📍 Connected to: ${supabaseUrl.replace(/\/$/, '')}`);
        return true;
      } else {
        console.error('❌ Supabase connection error:', error.message);
        console.error('   Error code:', error.code);
        console.error('   Error details:', error.details);
        return false;
      }
    }

    console.log('✅ Supabase connected successfully');
    console.log(`📍 Connected to: ${supabaseUrl.replace(/\/$/, '')}`);
    return true;
  } catch (error: any) {
    console.error('❌ Supabase connection error:', error.message);

    // Provide helpful error messages based on error type
    if (error.message?.includes('fetch failed')) {
      console.error('\n💡 Network connection issue detected:');
      console.error('   1. Check your internet connection');
      console.error('   2. Verify SUPABASE_URL is correct');
      console.error('   3. Check if Supabase project is active');
      console.error('   4. Try accessing the URL in a browser:', supabaseUrl);
    } else if (error.message?.includes('Invalid API key')) {
      console.error('\n💡 API key issue:');
      console.error('   1. Verify SUPABASE_ANON_KEY is correct');
      console.error('   2. Get it from: Supabase Dashboard → Settings → API → anon/public key');
    } else if (error.message?.includes('ENOTFOUND') || error.message?.includes('getaddrinfo')) {
      console.error('\n💡 DNS resolution issue:');
      console.error('   1. Check if SUPABASE_URL is correct');
      console.error('   2. Verify the Supabase project exists');
      console.error('   3. Check your network/DNS settings');
    }

    return false;
  }
};

export default supabase;
