// Test script for admin authentication and access
// Run this with: node test-admin.mjs

const BASE_URL = 'http://localhost:3002';

async function testAdminAccess() {
  console.log('👑 Testing Admin Authentication & Access\n');
  let authToken = '';

  // Test 1: Admin Login
  console.log('1️⃣  Testing Admin Login...');
  try {
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        email: 'admin@3yeses.com',
        password: 'AdminPassword123!',
        rememberMe: true,
      }),
    });

    const loginData = await loginResponse.json();
    console.log('✅ Admin Login Response:', loginData);

    // Extract auth token
    const cookies = loginResponse.headers.get('set-cookie');
    if (cookies) {
      authToken = cookies.split(';')[0];
      console.log('🍪 Admin Auth Token extracted');
    }
  } catch (error) {
    console.log('❌ Admin Login Error:', error.message);
  }

  // Test 2: Admin Session Verification
  console.log('\n2️⃣  Testing Admin Session Verification...');
  try {
    const verifyResponse = await fetch(`${BASE_URL}/api/auth/verify`, {
      method: 'GET',
      headers: {
        'Cookie': authToken,
      },
    });

    const verifyData = await verifyResponse.json();
    console.log('✅ Admin Verification Response:', verifyData);
  } catch (error) {
    console.log('❌ Admin Verification Error:', error.message);
  }

  // Test 3: Admin Dashboard Access
  console.log('\n3️⃣  Testing Admin Dashboard Access...');
  try {
    const adminResponse = await fetch(`${BASE_URL}/admin`, {
      method: 'GET',
      headers: {
        'Cookie': authToken,
      },
    });

    console.log('Admin Dashboard Status:', adminResponse.status);
    if (adminResponse.ok) {
      console.log('✅ Admin dashboard accessible');
    } else {
      console.log('❌ Admin dashboard access denied');
    }
  } catch (error) {
    console.log('❌ Admin Dashboard Error:', error.message);
  }

  // Test 4: Admin API Access (Users endpoint)
  console.log('\n4️⃣  Testing Admin API Access...');
  try {
    const usersResponse = await fetch(`${BASE_URL}/api/admin/users`, {
      method: 'GET',
      headers: {
        'Cookie': authToken,
      },
    });

    const usersData = await usersResponse.json();
    console.log('✅ Admin Users API Response:', usersData);
  } catch (error) {
    console.log('❌ Admin API Error:', error.message);
  }

  // Test 5: Admin Categories Management
  console.log('\n5️⃣  Testing Admin Categories Access...');
  try {
    const categoriesResponse = await fetch(`${BASE_URL}/api/admin/categories`, {
      method: 'GET',
      headers: {
        'Cookie': authToken,
      },
    });

    const categoriesData = await categoriesResponse.json();
    console.log('✅ Admin Categories API Response:', categoriesData);
  } catch (error) {
    console.log('❌ Admin Categories Error:', error.message);
  }

  console.log('\n🎉 Admin testing completed!');
}

testAdminAccess();
