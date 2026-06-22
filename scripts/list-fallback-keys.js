#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const messagesDir = path.join(__dirname, '..', 'messages');
const source = JSON.parse(fs.readFileSync(path.join(messagesDir, 'en.json'), 'utf8'));
function collectKeys(obj, prefix = '') {
  const keys = [];
  if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
    for (const key of Object.keys(obj)) {
      keys.push(...collectKeys(obj[key], prefix ? `${prefix}.${key}` : key));
    }
  } else if (prefix) {
    keys.push(prefix);
  }
  return keys;
}
const allKeys = collectKeys(source);
function getVal(obj, path) {
  return path.split('.').reduce((acc, k) => acc && acc[k], obj);
}
const locale = process.argv[2] || 'de-DE';
const namespace = process.argv[3] || 'dashboard';
const localeFile = `${locale}.json`;
const current = JSON.parse(fs.readFileSync(path.join(messagesDir, localeFile), 'utf8'));
const filtered = allKeys.filter((key) => key.startsWith(`${namespace}.`));
const results = filtered.map((key) => {
  const cur = getVal(current, key);
  const src = getVal(source, key);
  return { key, src, cur };
}).filter((item) => item.cur === item.src || item.cur === undefined);
if (!results.length) {
  console.log('No fallbacks in', locale, namespace);
} else {
  console.log(`Fallbacks for ${locale} ${namespace}: ${results.length}`);
  for (const item of results) {
    console.log(`${item.key} | ${item.src}`);
  }
}
