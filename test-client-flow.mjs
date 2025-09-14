// Test client registration and login functionality
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3001';

async function testClientFlow() {
  console.log('🧪 Testing Client Backend and Login Flow...\n');

  // Test 1: Register a new client
  console.log('1️⃣ Testing Client Registration...');
  const clientRegistration = {
    name: 'Test Client User',
    email: `testclient${Date.now()}@example.com`,
    password: 'TestPass123!',
    role: 'CLIENT'
  };

  try {
    const registerResponse = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(clientRegistration),
    });

    const registerResult = await registerResponse.json();
    console.log('Registration Response:', registerResult);

    if (registerResponse.ok) {
      console.log('✅ Client registration successful!');
      
      // Test 2: Login with the client
      console.log('\n2️⃣ Testing Client Login...');
      const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: clientRegistration.email,
          password: clientRegistration.password,
        }),
      });

      const loginResult = await loginResponse.json();
      console.log('Login Response:', loginResult);

      if (loginResponse.ok && loginResult.token) {
        console.log('✅ Client login successful!');
        console.log('🎯 User Role:', loginResult.user.role);
        console.log('🆔 User ID:', loginResult.user.userId);

        // Test 3: Verify token with profile endpoint
        console.log('\n3️⃣ Testing Profile Access...');
        const profileResponse = await fetch(`${BASE_URL}/api/profile`, {
          headers: {
            'Authorization': `Bearer ${loginResult.token}`,
          },
        });

        if (profileResponse.ok) {
          const profileResult = await profileResponse.json();
          console.log('Profile Response:', profileResult);
          console.log('✅ Profile access successful!');
        } else {
          console.log('❌ Profile access failed');
        }

        // Test 4: Test dashboard access
        console.log('\n4️⃣ Testing Dashboard Access...');
        const dashboardResponse = await fetch(`${BASE_URL}/dashboard`, {
          headers: {
            'Cookie': `auth-token=${loginResult.token}`,
          },
        });

        if (dashboardResponse.ok) {
          console.log('✅ Dashboard access successful!');
        } else {
          console.log('❌ Dashboard access failed:', dashboardResponse.status);
        }

      } else {
        console.log('❌ Client login failed');
      }
    } else {
      console.log('❌ Client registration failed');
    }
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }

  // Test 5: Register and test a talent user
  console.log('\n5️⃣ Testing Talent Registration...');
  const talentRegistration = {
    name: 'Test Talent User',
    email: `testtalent${Date.now()}@example.com`,
    password: 'TestPass123!',
    role: 'TALENT'
  };

  try {
    const talentRegisterResponse = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(talentRegistration),
    });

    const talentRegisterResult = await talentRegisterResponse.json();
    console.log('Talent Registration Response:', talentRegisterResult);

    if (talentRegisterResponse.ok) {
      console.log('✅ Talent registration successful!');
      
      // Login as talent
      const talentLoginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: talentRegistration.email,
          password: talentRegistration.password,
        }),
      });

      const talentLoginResult = await talentLoginResponse.json();
      
      if (talentLoginResponse.ok) {
        console.log('✅ Talent login successful!');
        console.log('🎯 User Role:', talentLoginResult.user.role);
      } else {
        console.log('❌ Talent login failed');
      }
    } else {
      console.log('❌ Talent registration failed');
    }
  } catch (error) {
    console.error('❌ Talent test failed:', error.message);
  }

  console.log('\n🏁 Testing Complete!');
}

// Run the test
testClientFlow();
