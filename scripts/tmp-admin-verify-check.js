(async () => {
  try {
    const loginRes = await fetch('http://localhost:3002/api/admin/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'admin@local.test', password: 'P@ssw0rd123!', rememberMe: false }),
    });

    const login = await loginRes.json();
    console.log('Login status:', loginRes.status);
    console.log('Login body:', login);

    if (!login.accessToken) {
      console.error('No access token in login response');
      process.exit(1);
    }

    const cookie = `accessToken=${login.accessToken}`;
    const verifyRes = await fetch('http://localhost:3002/api/auth/verify', {
      headers: { Cookie: cookie },
    });

    console.log('Verify status:', verifyRes.status);
    const verifyBody = await verifyRes.text();
    console.log('Verify body:', verifyBody);
  } catch (e) {
    console.error('Error:', e);
    process.exit(1);
  }
})();
