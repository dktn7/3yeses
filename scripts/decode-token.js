const token = process.argv[2];
if (!token) { console.error('Provide token'); process.exit(1); }
const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString('utf8'));
console.log(payload);
