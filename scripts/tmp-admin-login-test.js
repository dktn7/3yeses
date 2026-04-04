(async () => {
  try {
    const res = await fetch('http://localhost:3002/api/admin/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'admin@local.test', password: 'P@ssw0rd123!', rememberMe: false }),
    });

    console.log('Status:', res.status);
    console.log('Headers:');
    for (const [k, v] of res.headers) {
      console.log(k + ':', v);
    }
    const text = await res.text();
    console.log('Body:', text);
  } catch (e) {
    console.error('Request failed:', e);
    process.exit(1);
  }
})();
