#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const messagesDir = path.join(__dirname, '..', 'messages');
const sourceFile = path.join(messagesDir, 'en.json');
if (!fs.existsSync(sourceFile)) {
  console.error('Source locale not found:', sourceFile);
  process.exit(1);
}
const source = JSON.parse(fs.readFileSync(sourceFile, 'utf8'));
const sourceKeys = [];
function collectKeys(obj, prefix = '') {
  if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
    for (const key of Object.keys(obj)) {
      collectKeys(obj[key], prefix ? `${prefix}.${key}` : key);
    }
  } else {
    sourceKeys.push(prefix);
  }
}
collectKeys(source);
const localeFiles = fs.readdirSync(messagesDir).filter(file => file.endsWith('.json') && file !== 'en.json');
for (const localeFile of localeFiles) {
  const localePath = path.join(messagesDir, localeFile);
  const localeJson = JSON.parse(fs.readFileSync(localePath, 'utf8'));
  const language = localeFile.replace('.json', '');
  const counts = {};
  for (const key of sourceKeys) {
    const namespace = key.split('.')[0];
    counts[namespace] = counts[namespace] || { missing: 0, fallback: 0 };
    const parts = key.split('.');
    let sourceValue = source;
    let localeValue = localeJson;
    for (const part of parts) {
      sourceValue = sourceValue && sourceValue[part];
      localeValue = localeValue && localeValue[part];
    }
    if (localeValue === undefined) counts[namespace].missing++;
    else if (localeValue === sourceValue) counts[namespace].fallback++;
  }
  console.log(`\n=== ${language} ===`);
  Object.entries(counts)
    .filter(([, c]) => c.missing || c.fallback)
    .sort((a, b) => (b[1].fallback + b[1].missing) - (a[1].fallback + a[1].missing))
    .forEach(([ns, c]) => console.log(`${ns}: missing=${c.missing} fallback=${c.fallback}`));
}
