require('dotenv').config();
const bcrypt = require('bcryptjs');
const { Client } = require('pg');

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
    console.error('Error: DATABASE_URL must be set in .env file');
    process.exit(1);
}

const client = new Client({
    connectionString: databaseUrl,
});

async function fixAdmin() {
    const email = 'admin@sucar.com';
    const properPassword = '123456';

    console.log(`Connecting to database...`);
    await client.connect();

    try {
        console.log(`Checking accounts for ${email}...`);

        // 1. Fetch all users with this email (case insensitive)
        const res = await client.query('SELECT id, email FROM users WHERE email ILIKE $1', [email]);
        const users = res.rows;

        console.log(`Found ${users.length} user(s) with email ${email}.`);

        if (users.length > 1) {
            console.log('Multiple accounts found. Cleaning up duplicates...');

            const [firstUser, ...others] = users;
            const idsToDelete = others.map(u => u.id);

            console.log(`Keeping user ID: ${firstUser.id}. Deleting IDs: ${idsToDelete.join(', ')}`);

            for (const id of idsToDelete) {
                await client.query('DELETE FROM users WHERE id = $1', [id]);
            }
            console.log('Duplicates deleted.');

            // Update the kept user
            await updatePassword(firstUser.id, properPassword);

        } else if (users.length === 1) {
            console.log('Single account found. Verifying/updating password...');
            await updatePassword(users[0].id, properPassword);

        } else {
            console.log('No admin account found. Creating one...');
            await createAdmin(email, properPassword);
        }

    } catch (error) {
        console.error('Unexpected error:', error);
    } finally {
        await client.end();
    }
}

async function updatePassword(userId, newPassword) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    try {
        await client.query(
            'UPDATE users SET password = $1, role = $2, is_active = $3 WHERE id = $4',
            [hashedPassword, 'admin', true, userId]
        );
        console.log('Password updated successfully to "123456".');
    } catch (err) {
        console.error("Error updating password:", err);
    }
}

async function createAdmin(email, password) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    try {
        await client.query(
            `INSERT INTO users (name, email, password, phone, nrc, role, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            ['Super Admin', email, hashedPassword, '0000000000', 'ADMIN000', 'admin', true]
        );
        console.log('Admin account created successfully with password "123456".');
    } catch (err) {
        console.error("Error creating admin:", err);
    }
}

fixAdmin();
