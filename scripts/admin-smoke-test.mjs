/**
 * Admin Login & Dashboard Smoke Test
 * 
 * Usage: node scripts/admin-smoke-test.mjs
 * 
 * This script simulates the admin login flow, captures HttpOnly cookies,
 * and verifies access to the protected dashboard endpoint.
 */

const ORIGIN = 'http://localhost:3000';
const CREDENTIALS = {
  email: 'admin@local.test',
  password: 'P@ssw0rd123!',
  rememberMe: true
};

async function runTest() {
  console.log(`\n🚀 Starting Admin Auth Test on ${ORIGIN}...`);

  try {
    // 1. POST Login
    console.log(`\n1. Attempting login for ${CREDENTIALS.email}...`);
    const loginResponse = await fetch(`${ORIGIN}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(CREDENTIALS),
    });

    const loginJson = await loginResponse.json();
    const setCookies = loginResponse.headers.getSetCookie(); // Node 18+ method for multiple headers

    console.log(`   Status: ${loginResponse.status} ${loginResponse.statusText}`);
    console.log(`   Success: ${loginJson.success}`);
    
    if (setCookies.length > 0) {
      console.log(`   Cookies Received:`);
      setCookies.forEach(c => console.log(`     - ${c.split(';')[0]}...`));
    } else {
      console.warn(`   ⚠️ Warning: No Set-Cookie headers received!`);
    }

    if (!loginResponse.ok) {
      console.error(`   ❌ Login failed:`, loginJson);
      return;
    }

    // Prepare cookies for next request
    const cookieHeader = setCookies.map(c => c.split(';')[0]).join('; ');

    // 2. GET Dashboard
    console.log(`\n2. Attempting to fetch protected dashboard with cookies...`);
    const dashboardResponse = await fetch(`${ORIGIN}/api/admin/dashboard`, {
      headers: {
        'Cookie': cookieHeader,
      },
    });

    const dashboardJson = await dashboardResponse.json();

    console.log(`   Status: ${dashboardResponse.status} ${dashboardResponse.statusText}`);
    
    if (dashboardResponse.ok) {
      console.log(`   ✅ Dashboard access successful!`);
      console.log(`\nDashboard Stats Preview:`);
      console.table({
        'Total Users': dashboardJson.stats?.totalUsers,
        'Active Talent': dashboardJson.stats?.totalTalent,
        'Total Profiles': dashboardJson.stats?.totalProfiles,
        'Profile Views': dashboardJson.stats?.totalViews
      });
    } else {
      console.error(`   ❌ Dashboard access denied:`, dashboardJson);
    }

  } catch (error) {
    console.error(`\n💥 Test execution error:`, error.message);
    if (error.cause) console.error(`   Cause:`, error.cause.message);
  }
}

runTest();
