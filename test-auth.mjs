import fetch from 'node-fetch';

async function testAuth() {
  try {
    console.log('Testing NextAuth.js session endpoint...');
    const sessionResponse = await fetch('http://localhost:3012/api/auth/session');
    console.log('Session response status:', sessionResponse.status);
    const sessionData = await sessionResponse.json();
    console.log('Session data:', sessionData);

    console.log('\nTesting NextAuth.js CSRF token...');
    const csrfResponse = await fetch('http://localhost:3012/api/auth/csrf');
    console.log('CSRF response status:', csrfResponse.status);
    const csrfData = await csrfResponse.json();
    console.log('CSRF data:', csrfData);

    if (csrfData.csrfToken) {
      console.log('\nAttempting login with credentials...');
      const loginResponse = await fetch('http://localhost:3012/api/auth/callback/credentials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          csrfToken: csrfData.csrfToken,
          username: 'admin',
          password: 'secure-password-here',
          callbackUrl: 'http://localhost:3012/admin',
          json: true
        }),
      });
      
      console.log('Login response status:', loginResponse.status);
      try {
        const loginData = await loginResponse.json();
        console.log('Login response data:', loginData);
      } catch (e) {
        console.log('Could not parse login response as JSON');
        const text = await loginResponse.text();
        console.log('Login response text:', text.substring(0, 500) + '...');
      }
    }
  } catch (error) {
    console.error('Error testing auth:', error);
  }
}

testAuth();
