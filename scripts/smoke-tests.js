(async () => {
  const base = 'http://localhost:3000';

  // Wait for server to be ready (up to ~60s)
  for (let i = 0; i < 60; i++) {
    try {
      const r = await fetch(base);
      if (r.ok) {
        console.log('Server up');
        break;
      }
    } catch (e) {
      // ignore
    }
    await new Promise((r) => setTimeout(r, 1000));
  }

  try {
    // 1) Login (normal user)
    console.log('\n--- POST /api/auth/login ---');
    const loginResp = await fetch(`${base}/api/auth/login`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'talent1@test.com', password: 'Test123!', rememberMe: false }),
    });
    const loginText = await loginResp.text();
    console.log('Status:', loginResp.status);
    try { console.log(JSON.parse(loginText)); } catch { console.log(loginText); }

    let access = null;
    try { access = JSON.parse(loginText).accessToken; } catch (e) {}

    // 2) Verify (uses cookie)
    if (access) {
      console.log('\n--- GET /api/auth/verify (using accessToken cookie) ---');
      const verifyResp = await fetch(`${base}/api/auth/verify`, {
        method: 'GET',
        headers: { Cookie: `accessToken=${access}` },
      });
      const verifyText = await verifyResp.text();
      console.log('Status:', verifyResp.status);
      try { console.log(JSON.parse(verifyText)); } catch { console.log(verifyText); }
    } else {
      console.log('No access token returned; skipping verify.');
    }

    // 3) Admin login (should be unauthorized for regular talent)
    console.log('\n--- POST /api/admin/login (expect 403 if not admin) ---');
    const adminResp = await fetch(`${base}/api/admin/login`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'talent1@test.com', password: 'Test123!', rememberMe: false }),
    });
    const adminText = await adminResp.text();
    console.log('Status:', adminResp.status);
    try { console.log(JSON.parse(adminText)); } catch { console.log(adminText); }

  } catch (err) {
    console.error('Smoke tests error:', err);
  }
})();
