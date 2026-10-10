#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const messagesDir = path.join(__dirname, '..', 'messages');
const sourcePath = path.join(messagesDir, 'en.json');
const source = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
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
function getVal(obj, path) {
  return path.split('.').reduce((acc, key) => acc && acc[key], obj);
}
const localeFiles = fs.readdirSync(messagesDir).filter((f) => f.endsWith('.json') && f !== 'en.json');
for (const file of localeFiles) {
  const locale = file.replace('.json', '');
  const current = JSON.parse(fs.readFileSync(path.join(messagesDir, file), 'utf8'));
  const bakFile = fs.readdirSync(messagesDir).find((f) => f.startsWith(`${locale}.json.bak`));
  const backup = bakFile ? JSON.parse(fs.readFileSync(path.join(messagesDir, bakFile), 'utf8')) : null;
  let currentFallback = 0;
  let currentMissing = 0;
  let backupFallback = 0;
  let backupMissing = 0;
  let restorables = 0;
  for (const key of keys) {
    const src = getVal(source, key);
    const cur = getVal(current, key);
    if (cur === undefined) currentMissing++;
    else if (cur === src) currentFallback++;
    if (backup) {
      const bak = getVal(backup, key);
      if (bak === undefined) backupMissing++;
      else if (bak === src) backupFallback++;
      if ((cur === undefined || cur === src) && bak !== undefined && bak !== src) restorables++;
    }
  }
  console.log(`${locale}: current fallback=${currentFallback} missing=${currentMissing} backup fallback=${backupFallback} missing=${backupMissing} restorables=${restorables}`);
}
