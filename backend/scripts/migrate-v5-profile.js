const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@127.0.0.1:54323/postgres'
});

async function run() {
    try {
        await client.connect();
        console.log('Connected to database');

        // Update users table
        console.log('Updating users table for profile features...');
        await client.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS profile_picture_url TEXT,
            ADD COLUMN IF NOT EXISTS license_number TEXT,
            ADD COLUMN IF NOT EXISTS bio TEXT,
            ADD COLUMN IF NOT EXISTS business_name TEXT,
            ADD COLUMN IF NOT EXISTS address TEXT,
            ADD COLUMN IF NOT EXISTS business_hours JSONB;
        `);

        // Update bookings table
        console.log('Updating bookings table for pickup confirmation...');
        await client.query(`
            ALTER TABLE bookings 
            ADD COLUMN IF NOT EXISTS pickup_confirmed_by_client BOOLEAN DEFAULT FALSE,
            ADD COLUMN IF NOT EXISTS pickup_confirmation_time TIMESTAMP WITH TIME ZONE;
        `);

        console.log('Database migration v5 (profile & workflow) completed successfully');
    } catch (err) {
        console.error('Error updating database:', err);
    } finally {
        await client.end();
    }
}

run();
