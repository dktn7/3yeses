const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, '..', 'messages');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
let ok = true;
for (const f of files) {
  const p = path.join(dir, f);
  try {
    JSON.parse(fs.readFileSync(p, 'utf8'));
    console.log(f + ': OK');
  } catch (e) {
    console.error(f + ': ' + e.message);
    ok = false;
  }
}
if (!ok) process.exit(1);
else console.log('All messages JSON parsed successfully.');
