#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function parseArgs(argv) {
  const opts = {
    src: 'en.json',
    dir: 'messages',
    fill: 'english', // 'english' or 'placeholder'
    write: false,
    backup: false,
    languages: null,
    placeholderPrefix: '__MISSING_TRANSLATION__ ',
    indent: 2,
  };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--src' || a === '-s') opts.src = argv[++i];
    else if (a === '--dir' || a === '-d') opts.dir = argv[++i];
    else if (a === '--fill' || a === '-f') opts.fill = argv[++i];
    else if (a === '--write' || a === '-w') opts.write = true;
    else if (a === '--backup' || a === '-b') opts.backup = true;
    else if (a === '--languages' || a === '-l') opts.languages = argv[++i].split(',').map(x => x.trim()).filter(Boolean);
    else if (a === '--placeholderPrefix') opts.placeholderPrefix = argv[++i];
    else if (a === '--indent') opts.indent = parseInt(argv[++i], 10) || opts.indent;
    else if (a === '--help' || a === '-h') {
      usage();
      process.exit(0);
    } else {
      console.error('Unknown arg:', a);
      usage();
      process.exit(2);
    }
  }
  return opts;
}

function usage() {
  console.log(`Usage: node scripts/sync-translations.js [options]\n
Options:
  --src, -s            Source locale filename under messages (default: en.json)
  --dir, -d            Messages directory (default: messages)
  --fill, -f           How to fill missing translations: 'english' or 'placeholder' (default: english)
  --write, -w          Write changes to files (default: dry-run / no write)
  --backup, -b         Create a .bak timestamped backup when writing
  --languages, -l      Comma-separated list of locale filenames to process (defaults to all except src)
  --placeholderPrefix  Prefix for placeholder text (default: __MISSING_TRANSLATION__ )
  --indent             JSON indent spaces when writing (default: 2)
  --help, -h           Show this help
`);
}

function cloneValue(value, opts) {
  if (typeof value === 'string') {
    if (opts.fill === 'english') return value;
    return opts.placeholderPrefix + value;
  }
  if (Array.isArray(value)) return value.map(v => cloneValue(v, opts));
  if (value && typeof value === 'object') {
    const out = {};
    for (const k of Object.keys(value)) out[k] = cloneValue(value[k], opts);
    return out;
  }
  return value;
}

function sync(source, target, stats, opts, pathParts = []) {
  if (Array.isArray(source)) {
    if (!Array.isArray(target)) {
      stats.addedPaths.push(pathParts.join('.') || '[root]');
      return cloneValue(source, opts);
    }
    // For arrays of objects or primitives, ensure target has at least the same length
    for (let i = 0; i < source.length; i++) {
      if (i >= target.length) {
        target[i] = cloneValue(source[i], opts);
        stats.added++;
        stats.addedItems.push((pathParts.join('.') || '[root]') + '[' + i + ']');
      } else {
        const sp = pathParts.concat('[' + i + ']');
        target[i] = sync(source[i], target[i], stats, opts, sp);
      }
    }
    return target;
  }

  if (source && typeof source === 'object') {
    if (!target || typeof target !== 'object' || Array.isArray(target)) {
      stats.addedPaths.push(pathParts.join('.') || '[root]');
      const newObj = cloneValue(source, opts);
      stats.added += countKeys(newObj);
      return newObj;
    }
    for (const key of Object.keys(source)) {
      if (!(key in target)) {
        target[key] = cloneValue(source[key], opts);
        stats.added++;
        stats.addedItems.push((pathParts.concat(key).join('.')));
      } else {
        target[key] = sync(source[key], target[key], stats, opts, pathParts.concat(key));
      }
    }
    return target;
  }

  // primitive
  if (target === undefined) {
    stats.added++;
    stats.addedItems.push(pathParts.join('.') || '[root]');
    return cloneValue(source, opts);
  }
  return target;
}

function countKeys(obj) {
  if (obj == null) return 0;
  if (Array.isArray(obj)) return obj.reduce((s, v) => s + countKeys(v), 0);
  if (typeof obj === 'object') return Object.keys(obj).reduce((s, k) => s + countKeys(obj[k]), 0);
  return 1;
}

(async function main() {
  const opts = parseArgs(process.argv);
  const root = path.resolve(__dirname, '..');
  const messagesDir = path.join(root, opts.dir);
  const srcPath = path.join(messagesDir, opts.src);
  if (!fs.existsSync(srcPath)) {
    console.error('Source file not found:', srcPath);
    process.exit(1);
  }
  const srcRaw = fs.readFileSync(srcPath, 'utf8');
  let srcJson;
  try {
    srcJson = JSON.parse(srcRaw);
  } catch (e) {
    console.error('Failed to parse source JSON', e.message);
    process.exit(1);
  }

  const files = fs.readdirSync(messagesDir).filter(f => f.endsWith('.json'));
  const targets = files.filter(f => f !== opts.src && (!opts.languages || opts.languages.includes(f)));
  if (targets.length === 0) {
    console.log('No target locale files found to process. (checked', messagesDir, ')');
    process.exit(0);
  }

  const summary = [];

  for (const file of targets) {
    const p = path.join(messagesDir, file);
    let raw;
    try {
      raw = fs.readFileSync(p, 'utf8');
    } catch (e) {
      console.error('Failed to read', p, e.message);
      continue;
    }
    let json;
    try {
      json = JSON.parse(raw);
    } catch (e) {
      console.error('Invalid JSON in', file, e.message);
      continue;
    }

    const stats = { file, added: 0, addedItems: [], addedPaths: [] };
    const synced = sync(srcJson, json, stats, opts, []);

    if (stats.added === 0) {
      console.log(file + ': OK — no missing keys');
      summary.push({ file, added: 0 });
      continue;
    }

    console.log(file + ': missing keys found ->', stats.added);
    if (!opts.write) {
      console.log('  Dry-run (no writes). Use --write to apply changes.');
      console.log('  Example added items:', stats.addedItems.slice(0, 10));
      summary.push({ file, added: stats.added, addedItems: stats.addedItems });
      continue;
    }

    if (opts.backup) {
      const bak = p + '.bak.' + Date.now();
      fs.copyFileSync(p, bak);
      console.log('  Backup created:', bak);
    }

    try {
      fs.writeFileSync(p, JSON.stringify(synced, null, opts.indent) + '\n', 'utf8');
      console.log('  Written', file, ' (added', stats.added, 'items)');
      summary.push({ file, added: stats.added, addedItems: stats.addedItems });
    } catch (e) {
      console.error('  Failed writing', file, e.message);
    }
  }

  console.log('\nSummary:');
  for (const s of summary) console.log('-', s.file + ': added', s.added || 0);

  console.log('\nDone.');
})();
