// Simple admin login test
(async () => {
  const base = 'http://localhost:3000';
  try {
    const resp = await fetch(`${base}/api/admin/login`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'admin@local.test', password: 'P@ssw0rd123!', rememberMe: false }),
    });

    const text = await resp.text();
    console.log('Status:', resp.status);
    try { console.log(JSON.parse(text)); } catch { console.log(text); }
  } catch (e) {
    console.error('Request failed:', e);
    process.exit(1);
  }
})();
