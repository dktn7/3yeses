const { execSync } = require('child_process');

try {
  const out = execSync('netstat -ano | findstr :3000', { encoding: 'utf8' }).trim();
  if (!out) {
    console.log('No process found on port 3000');
    process.exit(0);
  }

  const lines = out.split(/\r?\n/).filter(Boolean);
  const pids = new Set();
  for (const line of lines) {
    const cols = line.trim().split(/\s+/);
    const pid = cols[cols.length - 1];
    if (pid) pids.add(pid);
  }

  for (const pid of pids) {
    console.log('Killing PID', pid);
    try {
      execSync(`taskkill /PID ${pid} /F`, { stdio: 'inherit' });
    } catch (e) {
      console.error('Failed to kill', pid, e.message);
    }
  }

  const remaining = execSync('netstat -ano | findstr :3000', { encoding: 'utf8' }).trim();
  if (!remaining) console.log('No remaining listeners on port 3000');
  else console.log('Remaining:', remaining);
} catch (e) {
  if (e.status === 1) {
    console.log('No process found on port 3000');
    process.exit(0);
  }
  console.error('Error while checking port 3000:', e.message);
  process.exit(1);
}
