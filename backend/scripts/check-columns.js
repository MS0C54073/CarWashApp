const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@127.0.0.1:54323/postgres'
});

async function run() {
    try {
        await client.connect();
        const tables = ['users', 'bookings'];
        for (const table of tables) {
            const res = await client.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = '${table}'`);
            console.log(`--- ${table} ---`);
            console.log(res.rows);
        }
    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

run();
