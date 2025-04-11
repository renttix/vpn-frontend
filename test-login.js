// Simple script to test login with admin credentials
import fetch from 'node-fetch';

async function testLogin() {
  try {
    const response = await fetch('http://localhost:3008/api/auth/callback/credentials', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'secure-password-here',
        redirect: false,
      }),
    });

    const data = await response.json();
    console.log('Login response:', data);
  } catch (error) {
    console.error('Error testing login:', error);
  }
}

testLogin();
