const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const TARGET_DIRS = ['app', 'components'];
const SKIP = [path.join(ROOT, 'app', 'globals.css')];

function walk(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (full.includes('.next') || full.includes('node_modules')) continue;
      walk(full, files);
    } else {
      files.push(full);
    }
  }
  return files;
}

function processFile(file) {
  if (SKIP.includes(file)) return false;
  let s = fs.readFileSync(file, 'utf8');
  const orig = s;

  // Replace paired neutral fallbacks
  s = s.replace(/bg-white\s+dark:bg-(?:gray|zinc)-\d{1,3}(?:\/\d{1,3})?/g, 'bg-light-surface dark:bg-dark-surface');

  // Replace standalone bg-white not followed by slash (avoid bg-white/xx)
  s = s.replace(/\bbg-white\b(?!\s*\/)/g, 'bg-light-surface');

  if (s !== orig) {
    fs.writeFileSync(file, s, 'utf8');
    return true;
  }
  return false;
}

function main() {
  const changed = [];
  for (const d of TARGET_DIRS) {
    const dir = path.join(ROOT, d);
    if (!fs.existsSync(dir)) continue;
    const files = walk(dir);
    for (const f of files) {
      try {
        if (processFile(f)) changed.push(f);
      } catch (err) {
        console.error('ERR', f, err.message);
      }
    }
  }
  console.log('Files changed:', changed.length);
  if (changed.length) console.log(changed.join('\n'));
}

main();
