const { Client } = require('pg');
require('dotenv').config();

const client = new Client({ connectionString: process.env.DATABASE_URL });

async function checkPolicies() {
    await client.connect();

    console.log('--- RLS Policies on users table ---');
    const res = await client.query(`
    select * from pg_policies where tablename = 'users';
  `);

    if (res.rows.length === 0) {
        console.log('No policies found.');
    } else {
        res.rows.forEach(r => {
            console.log(`Policy: ${r.policyname} | Cmd: ${r.cmd} | Roles: ${r.roles.join(', ')}`);
        });
    }

    console.log('\n--- Checking RLS enabled? ---');
    const rlsRes = await client.query(`
    SELECT relname, relrowsecurity 
    FROM pg_class 
    WHERE oid = 'users'::regclass;
  `);
    console.log('RLS Enabled:', rlsRes.rows[0].relrowsecurity);

    await client.end();
}

checkPolicies();
