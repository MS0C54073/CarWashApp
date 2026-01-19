const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
    connectionString: 'postgresql://postgres:postgres@127.0.0.1:54323/postgres'
});

async function run() {
    try {
        await client.connect();
        console.log('Connected to database');

        // 1. Add notification_read to bookings
        console.log('Adding notification_read to bookings...');
        await client.query(`
      ALTER TABLE bookings 
      ADD COLUMN IF NOT EXISTS notification_read BOOLEAN DEFAULT false;
    `);

        // 2. Add admin_level to users
        console.log('Adding admin_level to users...');
        await client.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS admin_level VARCHAR(50) DEFAULT 'standard';
    `);

        // 3. Update role constraint to include subadmin
        console.log('Updating role constraint...');
        // First, find the constraint name
        const res = await client.query(`
      SELECT conname 
      FROM pg_constraint 
      JOIN pg_class ON pg_class.oid = pg_constraint.conrelid 
      WHERE relname = 'users' AND contype = 'c' AND conname LIKE '%role%';
    `);

        if (res.rows.length > 0) {
            const constraintName = res.rows[0].conname;
            await client.query(`ALTER TABLE users DROP CONSTRAINT ${constraintName};`);
        }

        await client.query(`
      ALTER TABLE users 
      ADD CONSTRAINT users_role_check 
      CHECK (role IN ('client', 'driver', 'carwash', 'admin', 'subadmin'));
    `);

        console.log('Database updates completed successfully');
    } catch (err) {
        console.error('Error updating database:', err);
    } finally {
        await client.end();
    }
}

run();
