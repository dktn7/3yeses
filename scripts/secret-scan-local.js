#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function getStagedFiles() {
  try {
    const out = execSync('git diff --cached --name-only --diff-filter=ACM', { encoding: 'utf8' });
    return out.split(/\r?\n/).filter(Boolean);
  } catch (err) {
    // If this fails, fall back to all files
    return [];
  }
}

const patterns = [
  { name: 'Private key', re: /-----BEGIN (RSA )?PRIVATE KEY-----/m },
  { name: 'Stripe secret', re: /sk_(live|test)_[A-Za-z0-9]{8,}/i },
  { name: 'Resend key', re: /re_[A-Za-z0-9_\-]{16,}/i },
  { name: 'ImageKit private', re: /private_[A-Za-z0-9_\-]{8,}/i },
  { name: 'AWS Access Key ID', re: /AKIA[0-9A-Z]{16}/ },
  { name: 'Generic long secret', re: /[A-Za-z0-9_\-]{40,}/ },
];

function scanFile(file) {
  try {
    const contents = fs.readFileSync(file, 'utf8');
    const matches = [];
    for (const p of patterns) {
      if (p.re.test(contents)) matches.push(p.name);
    }
    return matches;
  } catch (err) {
    return [];
  }
}

function main() {
  const staged = getStagedFiles();
  const filesToScan = staged.length ? staged : [];

  if (!filesToScan.length) {
    // Nothing staged, skip
    process.exit(0);
  }

  const findings = [];
  for (const f of filesToScan) {
    const p = path.resolve(f);
    if (!fs.existsSync(p)) continue;
    const matches = scanFile(p);
    if (matches.length) findings.push({ file: f, matches });
  }

  if (findings.length) {
    console.error('\nPotential secrets detected in staged files:');
    for (const f of findings) {
      console.error(`- ${f.file}: ${f.matches.join(', ')}`);
    }
    console.error('\nCommit blocked. Inspect and remove secrets or move them to .env.local.');
    process.exit(1);
  }

  process.exit(0);
}

main();
