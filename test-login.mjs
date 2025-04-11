import fetch from 'node-fetch';

async function testAdminLogin() {
  try {
    // Test the admin login page
    console.log('Testing admin login page...');
    const response = await fetch('http://localhost:3012/admin/login');
    
    if (response.ok) {
      console.log('Admin login page is accessible!');
      console.log('Status:', response.status);
      
      // Get the HTML content
      const html = await response.text();
      console.log('HTML length:', html.length);
      
      // Print a snippet of the HTML content
      console.log('HTML snippet:');
      console.log(html.substring(0, 500) + '...');
      
      // Check for specific elements
      console.log('\nChecking for specific elements:');
      console.log('Contains "Admin Login":', html.includes('Admin Login'));
      console.log('Contains "Sign in":', html.includes('Sign in'));
      console.log('Contains "Username":', html.includes('Username'));
      console.log('Contains "Password":', html.includes('Password'));
      console.log('Contains "Loading":', html.includes('Loading'));
      
      // Check if the page is stuck at loading
      if (html.includes('Loading')) {
        console.log('\nThe page appears to be stuck at the loading state.');
      }
    } else {
      console.error('Failed to access admin login page');
      console.error('Status:', response.status);
    }
  } catch (error) {
    console.error('Error testing admin login:', error);
  }
}

testAdminLogin();
