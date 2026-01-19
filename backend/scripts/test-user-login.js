const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testUserLogin() {
  console.log('\n🔍 Testing User Login System\n');
  console.log(`📍 Supabase URL: ${supabaseUrl}`);
  
  // Get all users
  console.log('\n📋 Fetching all users...');
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('id, name, email, role, is_active, password')
    .limit(10);
  
  if (usersError) {
    console.error('❌ Error fetching users:', usersError);
    return;
  }
  
  if (!users || users.length === 0) {
    console.log('⚠️  No users found in database');
    return;
  }
  
  console.log(`✅ Found ${users.length} user(s):\n`);
  
  users.forEach((user, index) => {
    console.log(`${index + 1}. ${user.name} (${user.email})`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Active: ${user.is_active !== false ? 'Yes' : 'No'}`);
    console.log(`   Has Password: ${user.password ? 'Yes (' + user.password.substring(0, 20) + '...)' : 'NO ❌'}`);
    console.log('');
  });
  
  // Test email lookup
  if (users.length > 0) {
    const testEmail = users[0].email;
    console.log(`\n🔍 Testing email lookup for: ${testEmail}`);
    
    // Test exact match
    const { data: exactMatch, error: exactError } = await supabase
      .from('users')
      .select('*')
      .eq('email', testEmail)
      .maybeSingle();
    
    console.log(`   Exact match: ${exactMatch ? '✅ Found' : '❌ Not found'}`);
    if (exactError && exactError.code !== 'PGRST116') {
      console.log(`   Error: ${exactError.message}`);
    }
    
    // Test lowercase match
    const { data: lowerMatch, error: lowerError } = await supabase
      .from('users')
      .select('*')
      .eq('email', testEmail.toLowerCase())
      .maybeSingle();
    
    console.log(`   Lowercase match: ${lowerMatch ? '✅ Found' : '❌ Not found'}`);
    if (lowerError && lowerError.code !== 'PGRST116') {
      console.log(`   Error: ${lowerError.message}`);
    }
    
    // Test case-insensitive search
    const { data: allUsers } = await supabase
      .from('users')
      .select('*')
      .limit(100);
    
    const caseInsensitiveMatch = allUsers?.find(u => 
      u.email && u.email.toLowerCase() === testEmail.toLowerCase()
    );
    
    console.log(`   Case-insensitive match: ${caseInsensitiveMatch ? '✅ Found' : '❌ Not found'}`);
  }
  
  console.log('\n✅ Test complete\n');
}

testUserLogin().catch(console.error);
