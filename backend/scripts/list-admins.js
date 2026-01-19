require('dotenv').config();
const { Client } = require('pg');

const databaseUrl = process.env.DATABASE_URL;
const client = new Client({ connectionString: databaseUrl });

(async () => {
    try {
        await client.connect();
        console.log("Listing all admin users:");
        const res = await client.query("SELECT id, email, role, is_active FROM users WHERE role = 'admin'");
        console.log(JSON.stringify(res.rows, null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        await client.end();
    }
})();
