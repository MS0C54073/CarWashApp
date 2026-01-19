const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function debugLogin() {
  console.log('\n🔍 Debugging Login System\n');
  console.log(`📍 Supabase URL: ${supabaseUrl}\n`);
  
  // Test with a known user
  const testEmail = 'admin@sucar.com';
  const testPassword = 'admin123';
  
  console.log(`Testing login for: ${testEmail}`);
  console.log(`Password: ${testPassword}\n`);
  
  // Step 1: Find user
  console.log('Step 1: Finding user by email...');
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('email', testEmail)
    .maybeSingle();
  
  if (userError && userError.code !== 'PGRST116') {
    console.error('❌ Error finding user:', userError);
    return;
  }
  
  if (!user) {
    console.log('❌ User not found');
    
    // Try case-insensitive
    console.log('\nTrying case-insensitive search...');
    const { data: allUsers } = await supabase
      .from('users')
      .select('*')
      .limit(100);
    
    const foundUser = allUsers?.find(u => 
      u.email && u.email.toLowerCase() === testEmail.toLowerCase()
    );
    
    if (foundUser) {
      console.log(`✅ Found user with case-insensitive match: ${foundUser.email}`);
      console.log(`   Stored email: ${foundUser.email}`);
      console.log(`   Searching for: ${testEmail}`);
    } else {
      console.log('❌ User not found even with case-insensitive search');
      console.log('\nAvailable users:');
      allUsers?.forEach(u => {
        console.log(`  - ${u.email} (${u.name})`);
      });
    }
    return;
  }
  
  console.log(`✅ User found: ${user.name}`);
  console.log(`   Email: ${user.email}`);
  console.log(`   Role: ${user.role}`);
  console.log(`   Active: ${user.is_active !== false ? 'Yes' : 'No'}`);
  console.log(`   Has password: ${user.password ? 'Yes' : 'No'}`);
  
  if (!user.password) {
    console.log('❌ User has no password set!');
    return;
  }
  
  // Step 2: Compare password
  console.log('\nStep 2: Comparing password...');
  console.log(`   Stored hash: ${user.password.substring(0, 30)}...`);
  
  try {
    const isMatch = await bcrypt.compare(testPassword, user.password);
    console.log(`   Password match: ${isMatch ? '✅ YES' : '❌ NO'}`);
    
    if (!isMatch) {
      console.log('\n⚠️  Password mismatch!');
      console.log('   Trying to hash the test password to see format...');
      const salt = await bcrypt.genSalt(10);
      const testHash = await bcrypt.hash(testPassword, salt);
      console.log(`   Test password hash: ${testHash.substring(0, 30)}...`);
      console.log(`   Stored hash format: ${user.password.substring(0, 7)}...`);
      
      // Check if stored password is already plain text (shouldn't be)
      if (user.password === testPassword) {
        console.log('⚠️  WARNING: Password is stored in plain text!');
      }
    } else {
      console.log('✅ Password matches!');
    }
  } catch (error) {
    console.error('❌ Error comparing password:', error);
  }
  
  // Step 3: Check if active
  console.log('\nStep 3: Checking account status...');
  if (user.is_active === false) {
    console.log('❌ Account is deactivated');
  } else {
    console.log('✅ Account is active');
  }
  
  console.log('\n✅ Debug complete\n');
}

debugLogin().catch(console.error);
