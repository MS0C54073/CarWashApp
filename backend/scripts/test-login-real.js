
async function testLogin() {
    const url = 'http://localhost:5000/api/auth/login';
    const credentials = {
        email: 'admin@sucar.com',
        password: '123456'
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(credentials)
        });

        const data = await response.json();

        if (response.ok) {
            console.log('✅ Login Successful!');
            console.log('Token:', data.data.token ? 'Received' : 'Missing');
            console.log('User:', data.data.name);
        } else {
            console.log('❌ Login Failed:', response.status);
            console.log('Error:', JSON.stringify(data, null, 2));
        }
    } catch (error) {
        console.error('Network Error:', error.message);
    }
}

testLogin();
