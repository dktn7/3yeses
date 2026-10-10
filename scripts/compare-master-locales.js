#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const cp = require('child_process');
const root = path.join(__dirname, '..');
const messagesDir = path.join(root, 'messages');
const source = JSON.parse(fs.readFileSync(path.join(messagesDir, 'en.json'), 'utf8'));
const keys = [];
function collectKeys(obj, prefix = '') {
  if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
    for (const key of Object.keys(obj)) {
      collectKeys(obj[key], prefix ? `${prefix}.${key}` : key);
    }
  } else if (prefix) {
    keys.push(prefix);
  }
}
collectKeys(source);
function getVal(obj, pat) {
  return pat.split('.').reduce((acc, key) => acc && acc[key], obj);
}
const localeFiles = fs.readdirSync(messagesDir).filter((f) => f.endsWith('.json') && f !== 'en.json');
for (const file of localeFiles) {
  const locale = file.replace('.json', '');
  const current = JSON.parse(fs.readFileSync(path.join(messagesDir, file), 'utf8'));
  let master = null;
  try {
    const content = cp.execSync(`git show master:messages/${file}`, { cwd: root, encoding: 'utf8' });
    master = JSON.parse(content);
  } catch (err) {
    console.warn(`No master version for ${file}`);
  }
  let currentFallback = 0;
  let restorables = 0;
  let masterFallback = 0;
  for (const key of keys) {
    const src = getVal(source, key);
    const cur = getVal(current, key);
    if (cur === src) currentFallback++;
    if (master) {
      const m = getVal(master, key);
      if (m === src) masterFallback++;
      if (cur === src && m !== undefined && m !== src) restorables++;
    }
  }
  console.log(`${locale}: current fallback=${currentFallback} master fallback=${masterFallback} restorables=${restorables}`);
}
