(async () => {
  try {
    const loginRes = await fetch('http://localhost:3002/api/admin/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'admin@local.test', password: 'P@ssw0rd123!', rememberMe: false }),
    });

    const login = await loginRes.json();
    console.log('Login status:', loginRes.status);

    const cookie = `accessToken=${login.accessToken}`;
    const dashRes = await fetch('http://localhost:3002/api/admin/dashboard', {
      headers: { Cookie: cookie },
      redirect: 'manual'
    });

    console.log('Dashboard status:', dashRes.status);
    console.log('Dashboard headers:');
    for (const [k, v] of dashRes.headers) console.log(k + ':', v);
    const body = await dashRes.text();
    console.log('Body:', body);
  } catch (e) {
    console.error('Error:', e);
    process.exit(1);
  }
})();
