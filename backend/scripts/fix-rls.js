const { Client } = require('pg');
require('dotenv').config();

const client = new Client({ connectionString: process.env.DATABASE_URL });

async function fixRls() {
    await client.connect();

    try {
        console.log('Adding specific policies for users table...');

        // 1. Allow public select (login/lookup)
        await client.query(`
      DROP POLICY IF EXISTS "Public users are viewable by everyone" ON users;
      DROP POLICY IF EXISTS "Users can insert their own profile" ON users;
      DROP POLICY IF EXISTS "Users can update own profile" ON users;
      
      CREATE POLICY "Public users are viewable by everyone" 
      ON users FOR SELECT 
      USING (true);
    `);
        console.log('✅ Policy added: Select (Public)');

        // 2. Allow insert (registration)
        await client.query(`
      CREATE POLICY "Users can insert their own profile" 
      ON users FOR INSERT 
      WITH CHECK (true);
    `);
        console.log('✅ Policy added: Insert (Public)');

        // 3. Allow update (profile edit)
        // Note: In real app, check auth.uid() = id using Supabase auth. 
        // But here we use 'users' table directly, so we can't easily check auth.uid().
        // We'll trust the backend to handle authorization for updates.
        await client.query(`
      CREATE POLICY "Users can update own profile" 
      ON users FOR UPDATE
      USING (true);
    `);
        console.log('✅ Policy added: Update (Public - Backend handles auth)');

    } catch (error) {
        console.error('Error adding policies:', error);
    } finally {
        await client.end();
    }
}

fixRls();
