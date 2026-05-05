#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function getStagedFiles() {
  try {
    const out = execSync('git diff --cached --name-only --diff-filter=ACM', { encoding: 'utf8' });
    return out.split(/\r?\n/).filter(Boolean);
  } catch (err) {
    return [];
  }
}

// File extensions that are likely binary/assets and should be skipped
const binaryExts = new Set([
  '.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp', '.mp3', '.mp4', '.woff', '.woff2', '.ttf', '.eot', '.zip', '.gz', '.tar', '.dump', '.ico'
]);

// Paths to ignore (common noisy folders and known large assets)
const ignoreSubpaths = [
  'backups/', 'backup_', 'public/ads/', 'public/images/', 'agent-runtime/', '.next/', 'node_modules/', 'backups/', 'tmp_home.html', 'docs/'
];

const patterns = [
  { name: 'Private key', re: /-----BEGIN [A-Z ]*PRIVATE KEY-----/m },
  { name: 'Stripe secret', re: /sk_(live|test)_[A-Za-z0-9]{8,}/i },
  // Require longer tokens to reduce false positives in docs/placeholders
  { name: 'Resend key', re: /re_[A-Za-z0-9_\-]{20,}/i },
  { name: 'ImageKit private', re: /private_[A-Za-z0-9_\-]{8,}/i },
  { name: 'AWS Access Key ID', re: /AKIA[0-9A-Z]{16}/ },
  // Only match JWT secret when assigned (e.g. in .env) to avoid matching code references
  { name: 'JWT env var', re: /^\s*JWT(_REFRESH)?_SECRET\s*=/mi }
];

function isLikelyBinary(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (binaryExts.has(ext)) return true;
  try {
    const stat = fs.statSync(filePath);
    if (stat.size > 200 * 1024) return true; // skip very large files
    const buf = fs.readFileSync(filePath);
    // check for null byte which indicates binary
    for (let i = 0; i < Math.min(buf.length, 1024); i++) {
      if (buf[i] === 0) return true;
    }
    return false;
  } catch (err) {
    return true; // unreadable -> treat as binary/skip
  }
}

function shouldIgnorePath(filePath) {
  const normalized = filePath.replace(/\\\\/g, '/');
  for (const p of ignoreSubpaths) {
    if (normalized.includes(p)) return true;
  }
  // ignore lockfiles and known generated files
  if (normalized.endsWith('package-lock.json') || normalized.endsWith('yarn.lock') || normalized.endsWith('pnpm-lock.yaml')) return true;
  return false;
}

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
  if (!staged.length) process.exit(0);

  const filesToScan = staged.filter(f => {
    if (shouldIgnorePath(f)) return false;
    const abs = path.resolve(f);
    if (!fs.existsSync(abs)) return false;
    return !isLikelyBinary(abs);
  });

  if (!filesToScan.length) process.exit(0);

  const findings = [];
  for (const f of filesToScan) {
    const p = path.resolve(f);
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
