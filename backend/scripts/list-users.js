const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@127.0.0.1:54323/postgres'
});

async function run() {
    try {
        await client.connect();
        const res = await client.query("SELECT id, name, email, role, is_active FROM users");
        console.log(`Total users: ${res.rowCount}`);
        console.log(JSON.stringify(res.rows, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

run();
