/**
 * Script to create an admin user
 * Usage: node scripts/create-admin.js <email> <password> <name> <phone> <nrc>
 * Example: node scripts/create-admin.js admin@sucar.com password123 "Admin User" "1234567890" "ADMIN001"
 */

require('dotenv').config();
const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: SUPABASE_URL and SUPABASE_ANON_KEY must be set in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createAdmin() {
  const args = process.argv.slice(2);
  
  if (args.length < 5) {
    console.log('Usage: node scripts/create-admin.js <email> <password> <name> <phone> <nrc>');
    console.log('Example: node scripts/create-admin.js admin@sucar.com password123 "Admin User" "1234567890" "ADMIN001"');
    process.exit(1);
  }

  const [email, password, name, phone, nrc] = args;

  try {
    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .ilike('email', email)
      .single();

    if (existingUser) {
      console.error(`Error: User with email ${email} already exists`);
      process.exit(1);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create admin user
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
      console.error('Error creating admin user:', error);
      process.exit(1);
    }

    console.log('✅ Admin user created successfully!');
    console.log('\nAdmin Details:');
    console.log(`  Email: ${email}`);
    console.log(`  Password: ${password}`);
    console.log(`  Name: ${name}`);
    console.log(`  Role: admin`);
    console.log('\nYou can now login at http://localhost:5173/login');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

createAdmin();
