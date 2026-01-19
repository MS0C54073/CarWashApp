/**
 * Simple script to reset admin password
 * Usage: node scripts/reset-admin-password.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

const supabaseUrl = process.env.SUPABASE_URL || 'http://localhost:54321';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY not found in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function resetAdminPassword() {
  try {
    console.log('🔍 Finding admin users...\n');

    // Find admin users
    const { data: admins, error: fetchError } = await supabase
      .from('users')
      .select('id, email, name, role')
      .eq('role', 'admin');

    if (fetchError) {
      console.error('❌ Error fetching admins:', fetchError);
      return;
    }

    if (!admins || admins.length === 0) {
      console.log('📝 No admin users found. Creating one...\n');
      
      const defaultPassword = 'admin123';
      const hashedPassword = await bcrypt.hash(defaultPassword, 10);

      const { data: newAdmin, error: createError } = await supabase
        .from('users')
        .insert({
          name: 'Admin User',
          email: 'admin@sucar.com',
          password: hashedPassword,
          role: 'admin',
          is_active: true,
          phone: '+1234567890',
          nrc: 'ADMIN001',
        })
        .select('id, email, name')
        .single();

      if (createError) {
        console.error('❌ Error creating admin:', createError);
        return;
      }

      console.log('✅ Admin user created successfully!');
      console.log('\n📋 Login Credentials:');
      console.log('   Email: admin@sucar.com');
      console.log('   Password: admin123\n');
      return;
    }

    // Reset password for existing admins
    console.log(`Found ${admins.length} admin user(s). Resetting passwords...\n`);

    const defaultPassword = 'admin123';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    for (const admin of admins) {
      console.log(`Resetting password for: ${admin.email} (${admin.name})`);

      const { error: updateError } = await supabase
        .from('users')
        .update({
          password: hashedPassword,
          is_active: true,
        })
        .eq('id', admin.id);

      if (updateError) {
        console.error(`❌ Error updating ${admin.email}:`, updateError.message);
        continue;
      }

      console.log(`✅ Password reset for ${admin.email}`);
    }

    console.log('\n✅ All admin passwords reset!');
    console.log('\n📋 Login Credentials:');
    console.log('   Email: admin@sucar.com (or any admin email above)');
    console.log('   Password: admin123\n');
    console.log('Try logging in now!\n');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

resetAdminPassword();
