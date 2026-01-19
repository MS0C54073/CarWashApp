/**
 * Script to fix admin login issues
 * This script will:
 * 1. Check if admin user exists
 * 2. Reset admin password if needed
 * 3. Ensure admin user is active
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

async function fixAdminLogin() {
  try {
    console.log('🔍 Checking admin users...\n');

    // Check for existing admin users
    const { data: admins, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'admin')
      .ilike('email', '%admin%');

    if (fetchError) {
      console.error('❌ Error fetching admins:', fetchError);
      return;
    }

    console.log(`Found ${admins?.length || 0} admin user(s)\n`);

    if (!admins || admins.length === 0) {
      console.log('📝 Creating new admin user...\n');
      
      const defaultPassword = 'admin123';
      const hashedPassword = await bcrypt.hash(defaultPassword, 10);

      const { data: newAdmin, error: createError } = await supabase
        .from('users')
        .insert({
          name: 'Admin User',
          email: 'admin@sucar.com',
          password: hashedPassword,
          role: 'admin',
          admin_level: 'super_admin',
          is_active: true,
          phone: '+1234567890',
        })
        .select()
        .single();

      if (createError) {
        console.error('❌ Error creating admin:', createError);
        return;
      }

      console.log('✅ Admin user created successfully!');
      console.log('\n📋 Login Credentials:');
      console.log('   Email: admin@sucar.com');
      console.log('   Password: admin123');
      console.log('   Role: admin');
      console.log('   Admin Level: super_admin\n');
      return;
    }

    // Fix existing admin users
    console.log('🔧 Fixing existing admin users...\n');

    for (const admin of admins) {
      console.log(`Processing: ${admin.email} (${admin.name})`);

      const defaultPassword = 'admin123';
      const hashedPassword = await bcrypt.hash(defaultPassword, 10);

      const updates = {
        password: hashedPassword,
        is_active: true,
        admin_level: admin.admin_level || 'super_admin',
      };

      const { error: updateError } = await supabase
        .from('users')
        .update(updates)
        .eq('id', admin.id);

      if (updateError) {
        console.error(`❌ Error updating ${admin.email}:`, updateError);
        continue;
      }

      console.log(`✅ Fixed ${admin.email}`);
      console.log('   Password reset to: admin123');
      console.log('   Status: Active');
      console.log(`   Admin Level: ${updates.admin_level}\n`);
    }

    console.log('\n✅ All admin users fixed!');
    console.log('\n📋 Login Credentials:');
    console.log('   Email: (use any admin email from above)');
    console.log('   Password: admin123\n');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

fixAdminLogin();
