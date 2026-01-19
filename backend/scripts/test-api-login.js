const http = require('http');

const API_URL = process.env.API_URL || 'http://localhost:5000';

async function testAPILogin() {
  console.log('\n🔐 Testing API Login Endpoint\n');
  console.log(`📍 API URL: ${API_URL}/api/auth/login\n`);
  
  // Test data
  const testData = JSON.stringify({
    email: 'admin@sucar.com',
    password: 'admin123'
  });
  
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(testData)
    }
  };
  
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`Status Code: ${res.statusCode}`);
        console.log(`Response Headers:`, res.headers);
        console.log(`\nResponse Body:`);
        try {
          const parsed = JSON.parse(data);
          console.log(JSON.stringify(parsed, null, 2));
        } catch (e) {
          console.log(data);
        }
        resolve();
      });
    });
    
    req.on('error', (error) => {
      console.error(`❌ Request error: ${error.message}`);
      if (error.code === 'ECONNREFUSED') {
        console.error('\n⚠️  Backend server is not running!');
        console.error('   Please start the backend with: cd backend && npm run dev');
      }
      reject(error);
    });
    
    req.write(testData);
    req.end();
  });
}

testAPILogin().catch(console.error);
