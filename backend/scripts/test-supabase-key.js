require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

async function testKeys() {
    const url = process.env.SUPABASE_URL;
    const anonKey = process.env.SUPABASE_ANON_KEY;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    console.log('Testing Anon Key...');
    const anonClient = createClient(url, anonKey);
    const { data: anonData, error: anonError } = await anonClient.from('users').select('*').limit(1);
    console.log('Anon Result:', anonData ? `Found ${anonData.length} users` : 'null');
    if (anonError) console.log('Anon Error:', anonError.message);

    console.log('\nTesting Service Key...');
    const serviceClient = createClient(url, serviceKey);
    const { data: serviceData, error: serviceError } = await serviceClient.from('users').select('*').limit(1);
    console.log('Service Result:', serviceData ? `Found ${serviceData.length} users` : 'null');
    if (serviceError) console.log('Service Error:', serviceError.message);

    // Specific check for admin
    console.log('\nSearching for admin with Service Key...');
    const { data: adminData } = await serviceClient.from('users').select('*').eq('email', 'admin@sucar.com');
    console.log('Admin Found:', adminData && adminData.length > 0 ? 'YES' : 'NO');
}

testKeys();
