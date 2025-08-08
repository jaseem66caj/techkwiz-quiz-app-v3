// Test the admin login directly
const fetch = require('node-fetch');

async function testAdminLogin() {
  try {
    console.log('Testing admin login...');
    
    const response = await fetch('https://7e939139-7b5b-41a4-acb4-06a518efd334.preview.emergentagent.com/api/admin/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'TechKwiz2025!'
      })
    });
    
    console.log('Response status:', response.status);
    const data = await response.json();
    console.log('Response data:', data);
    
    if (data.access_token) {
      console.log('✅ Login successful, testing verification...');
      
      // Test token verification
      const verifyResponse = await fetch('https://7e939139-7b5b-41a4-acb4-06a518efd334.preview.emergentagent.com/api/admin/verify', {
        headers: {
          'Authorization': `Bearer ${data.access_token}`
        }
      });
      
      console.log('Verify status:', verifyResponse.status);
      const verifyData = await verifyResponse.json();
      console.log('Verify data:', verifyData);
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testAdminLogin();
