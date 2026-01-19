/**
 * Test login script to debug login issues
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

const supabaseUrl = process.env.SUPABASE_URL || 'http://localhost:54321';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testLogin() {
  try {
    const email = 'admin@sucar.com';
    const password = 'admin123';

    console.log('Testing login for:', email);
    console.log('Password:', password);
    console.log('');

    // Get user
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .ilike('email', email)
      .single();

    if (userError) {
      console.error('❌ Error fetching user:', userError);
      return;
    }

    if (!user) {
      console.error('❌ User not found');
      return;
    }

    console.log('✅ User found:');
    console.log('   ID:', user.id);
    console.log('   Email:', user.email);
    console.log('   Name:', user.name);
    console.log('   Role:', user.role);
    console.log('   Is Active:', user.is_active);
    console.log('   Has Password:', !!user.password);
    console.log('   Password Length:', user.password ? user.password.length : 0);
    console.log('');

    if (!user.password) {
      console.log('❌ User has no password! Resetting...');
      const newHash = await bcrypt.hash(password, 10);
      const { error: updateError } = await supabase
        .from('users')
        .update({ password: newHash, is_active: true })
        .eq('id', user.id);
      
      if (updateError) {
        console.error('❌ Error updating password:', updateError);
      } else {
        console.log('✅ Password reset successfully!');
        console.log('   New hash:', newHash);
      }
      return;
    }

    // Test password comparison
    console.log('Testing password comparison...');
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password match:', isMatch);
    console.log('');

    if (!isMatch) {
      console.log('❌ Password mismatch! Resetting password...');
      const newHash = await bcrypt.hash(password, 10);
      const { error: updateError } = await supabase
        .from('users')
        .update({ password: newHash, is_active: true })
        .eq('id', user.id);
      
      if (updateError) {
        console.error('❌ Error updating password:', updateError);
      } else {
        console.log('✅ Password reset successfully!');
        console.log('   New hash:', newHash);
        console.log('');
        console.log('Try logging in again with:');
        console.log('   Email:', email);
        console.log('   Password:', password);
      }
    } else {
      console.log('✅ Password matches! Login should work.');
      console.log('');
      console.log('If login still fails, check:');
      console.log('   1. Backend is running');
      console.log('   2. API_URL is correct in frontend');
      console.log('   3. CORS is configured correctly');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testLogin();
