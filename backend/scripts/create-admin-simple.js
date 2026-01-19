/**
 * Simple script to create an admin user
 * Usage: node scripts/create-admin-simple.js
 */

require('dotenv').config();
const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

console.log('Creating admin user...');
console.log('Supabase URL:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseKey);

async function createAdmin() {
  const email = 'admin@sucar.com';
  const password = 'password123';
  const name = 'Admin User';
  const phone = '1234567890';
  const nrc = 'ADMIN001';

  try {
    // Check if user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('*')
      .ilike('email', email)
      .maybeSingle();

    if (existingUser) {
      console.log('⚠️  User already exists. Updating to admin role...');
      
      // Update existing user to admin
      const { data: updatedUser, error: updateError } = await supabase
        .from('users')
        .update({
          role: 'admin',
          is_active: true,
        })
        .eq('email', email)
        .select()
        .single();

      if (updateError) {
        console.error('❌ Error updating user:', updateError);
        process.exit(1);
      }

      console.log('✅ User updated to admin successfully!');
      console.log('\nAdmin Details:');
      console.log(`  Email: ${email}`);
      console.log(`  Password: ${password}`);
      console.log(`  Name: ${name}`);
      console.log(`  Role: admin`);
      console.log('\nYou can now login at http://localhost:5173/login');
      return;
    }

    // Hash password
    console.log('Hashing password...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    console.log('Password hashed successfully');

    // Create admin user
    console.log('Inserting admin user into database...');
    const { data, error } = await supabase
      .from('users')
      .insert({
        name,
        email,
        password: hashedPassword,
        phone,
        nrc,
        role: 'admin',
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating admin user:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      process.exit(1);
    }

    console.log('✅ Admin user created successfully!');
    console.log('\nAdmin Details:');
    console.log(`  Email: ${email}`);
    console.log(`  Password: ${password}`);
    console.log(`  Name: ${name}`);
    console.log(`  Role: admin`);
    console.log(`  ID: ${data.id}`);
    console.log('\nYou can now login at http://localhost:5173/login');
    console.log('\nLogin credentials:');
    console.log(`  Email: ${email}`);
    console.log(`  Password: ${password}`);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

createAdmin();
