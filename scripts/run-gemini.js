const { spawn, execSync } = require('child_process');

const args = process.argv.slice(2);

if (process.platform === 'win32') {
  try {
    execSync('chcp 65001 > nul', { stdio: 'ignore' });
  } catch (e) {
    // If chcp isn't available or fails, continue and let the CLI show a meaningful error
    // This keeps behavior safe and non-blocking.
  }
}

const child = spawn('gemini', args, { stdio: 'inherit' });

child.on('exit', (code, signal) => {
  if (signal) process.exit(1);
  process.exit(code ?? 0);
});

child.on('error', (err) => {
  console.error('Failed to start `gemini` CLI:', err.message);
  console.error('Make sure `gemini` is installed and available in your PATH.');
  process.exit(1);
});
