const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const messagesDir = path.join(root, 'messages');
const source = JSON.parse(fs.readFileSync(path.join(messagesDir, 'en.json'), 'utf8'));
const allowlist = JSON.parse(fs.readFileSync(path.join(root, 'localization/dashboard-translation-allowlist.json'), 'utf8'));
const locales = ['ar', 'de-DE', 'es-ES', 'fr-FR', 'it-IT', 'ja-JP', 'pt-PT', 'ru-RU', 'zh-CN'];

function flatten(value, prefix = '', result = {}) {
  for (const [key, child] of Object.entries(value || {})) {
    const next = prefix ? `${prefix}.${key}` : key;
    if (child && typeof child === 'object' && !Array.isArray(child)) flatten(child, next, result);
    else result[next] = child;
  }
  return result;
}

function placeholders(value) {
  return (String(value).match(/\{[^}]+\}/g) || []).sort().join('|');
}

const sourceKeys = flatten(source.dashboard, 'dashboard');
const failures = [];

for (const locale of locales) {
  const file = path.join(messagesDir, `${locale}.json`);
  const current = flatten(JSON.parse(fs.readFileSync(file, 'utf8')));
  for (const [key, sourceValue] of Object.entries(sourceKeys)) {
    const value = current[key];
    if (value === undefined) {
      failures.push(`${locale}: missing ${key}`);
      continue;
    }
    if (placeholders(sourceValue) !== placeholders(value)) {
      failures.push(`${locale}: placeholder mismatch ${key}`);
    }
    if (allowlist.exactKeys.includes(key)) continue;
    if (typeof sourceValue === 'string' && value === sourceValue && !allowlist.exactValues.includes(value)) {
      failures.push(`${locale}: English fallback ${key}`);
    }
  }
}

if (failures.length) {
  console.error(`Dashboard translation gate failed: ${failures.length} issue(s)`);
  console.error(failures.slice(0, 120).join('\n'));
  if (failures.length > 120) console.error(`...and ${failures.length - 120} more`);
  process.exitCode = 1;
} else {
  console.log(JSON.stringify({ ok: true, locales: locales.length, namespace: 'dashboard' }, null, 2));
}
