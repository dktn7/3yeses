// Test script for authentication endpoints
// Run this with: node test-auth.mjs

const BASE_URL = 'http://localhost:3002';

async function testAuthEndpoints() {
  console.log('🧪 Testing Authentication Endpoints\n');
  let authToken = ''; // Variable to store the auth token
  let userId = '';    // Variable to store the user ID

  // Test 1: Register a new user
  console.log('1️⃣  Testing Registration...');
  try {
    const registerResponse = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@3yeses.com',
        password: 'SecurePassword123!',
        name: 'John Doe',
        role: 'talent',
        agreeToTerms: true,
        agreeToPrivacy: true,
        confirmAge: true,
      }),
    });

    const registerData = await registerResponse.json();
    console.log('✅ Registration Response:', registerData);
  } catch (error) {
    console.log('❌ Registration Error:', error.message);
  }

  // Test 2: Login with the test user
  console.log('\n2️⃣  Testing Login...');
  try {
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        email: 'test@3yeses.com',
        password: 'SecurePassword123!',
        rememberMe: true,
      }),
    });

    const loginData = await loginResponse.json();
    console.log('✅ Login Response:', loginData);

    // Extract cookies and user ID for subsequent requests
    const cookies = loginResponse.headers.get('set-cookie');
    if (cookies) {
      authToken = cookies.split(';')[0]; // Get the 'auth-token=...' part
      console.log('🍪 Extracted Auth Token:', authToken);
    }
    
    // Store user ID for protected route test
    if (loginData.success && loginData.user) {
      userId = loginData.user.id;
    }
  } catch (error) {
    console.log('❌ Login Error:', error.message);
  }

  // Test 3: Verify authentication
  console.log('\n3️⃣  Testing Session Verification...');
  try {
    const verifyResponse = await fetch(`${BASE_URL}/api/auth/verify`, {
      method: 'GET',
      headers: {
        'Cookie': authToken,
      },
    });

    const verifyData = await verifyResponse.json();
    console.log('✅ Verification Response:', verifyData);
  } catch (error) {
    console.log('❌ Verification Error:', error.message);
  }

  // Test 4: Test protected route
  console.log('\n4️⃣  Testing Protected Route...');
  try {
    const talentResponse = await fetch(`${BASE_URL}/api/talent/cmdxsv0wf0002vvh8eks68ifa`, {
      method: 'GET',
      headers: {
        'Cookie': authToken,
      },
    });

    const talentData = await talentResponse.json();
    console.log('✅ Protected Route Response:', talentData);
  } catch (error) {
    console.log('❌ Protected Route Error:', error.message);
  }

  // Test 5: Logout
  console.log('\n5️⃣  Testing Logout...');
  try {
    const logoutResponse = await fetch(`${BASE_URL}/api/auth/logout`, {
      method: 'POST',
      headers: {
        'Cookie': authToken,
      },
    });

    const logoutData = await logoutResponse.json();
    console.log('✅ Logout Response:', logoutData);
  } catch (error) {
    console.log('❌ Logout Error:', error.message);
  }

  console.log('\n🎉 Authentication testing completed!');
}

// Run the tests
testAuthEndpoints().catch(console.error);
