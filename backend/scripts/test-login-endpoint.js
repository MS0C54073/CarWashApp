const axios = require('axios');
require('dotenv').config();

const API_URL = process.env.API_URL || 'http://localhost:5000/api';

async function testLogin() {
  console.log('\n🔐 Testing Login Endpoint\n');
  console.log(`📍 API URL: ${API_URL}/auth/login\n`);
  
  const testUsers = [
    { email: 'test@test.com', password: 'password123' },
    { email: 'admin@sucar.com', password: 'admin123' },
    { email: 'musondasalim@gmail.com', password: 'password123' },
  ];
  
  for (const user of testUsers) {
    console.log(`Testing login for: ${user.email}`);
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email: user.email,
        password: user.password,
      });
      
      if (response.data.success) {
        console.log(`✅ Login successful!`);
        console.log(`   User: ${response.data.data.name} (${response.data.data.role})`);
        console.log(`   Token: ${response.data.data.token.substring(0, 20)}...`);
      } else {
        console.log(`❌ Login failed: ${response.data.message}`);
      }
    } catch (error) {
      if (error.response) {
        console.log(`❌ Login failed: ${error.response.data.message || error.response.statusText}`);
        console.log(`   Status: ${error.response.status}`);
      } else if (error.request) {
        console.log(`❌ No response from server. Is the backend running?`);
        console.log(`   Error: ${error.message}`);
      } else {
        console.log(`❌ Error: ${error.message}`);
      }
    }
    console.log('');
  }
  
  console.log('✅ Test complete\n');
}

testLogin().catch(console.error);
