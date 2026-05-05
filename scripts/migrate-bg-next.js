const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const TARGET_DIRS = ['app', 'components'];
const EXT = ['.ts', '.tsx', '.js', '.jsx', '.html'];
const MAX_FILES = 20;

function walk(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (full.includes('.next') || full.includes('node_modules')) continue;
      walk(full, files);
    } else {
      if (EXT.includes(path.extname(e.name))) files.push(full);
    }
  }
  return files;
}

function isNeutralDarkClass(cls) {
  // treat gray and zinc neutrals as generic dark surface fallbacks
  return /^(dark:bg-(?:gray|zinc)-\d{3}|dark:bg-(?:gray|zinc)-\d{1,3}(?:\/\d{1,3})?)$/.test(cls);
}

function processFile(file) {
  let s = fs.readFileSync(file, 'utf8');
  let orig = s;

  // 1) Replace paired patterns like `bg-white dark:bg-gray-800` -> `bg-light-surface dark:bg-dark-surface`
  s = s.replace(/bg-white\s+dark:bg-([\w-\/]+)/g, (m, cls) => {
    // Only replace when the dark fallback looks neutral (gray/zinc)
    if (/^(?:gray|zinc)-/.test(cls) || cls.startsWith('gray') || cls.startsWith('zinc')) {
      return 'bg-light-surface dark:bg-dark-surface';
    }
    return m; // leave color-specific dark overrides (e.g., dark:bg-red-500)
  });

  // 2) Replace standalone non-opacity `bg-white` -> `bg-light-surface` (avoid `bg-white/` opacity forms)
  s = s.replace(/\bbg-white\b(?!\s*\/)/g, (m) => {
    return 'bg-light-surface';
  });

  if (s !== orig) {
    fs.writeFileSync(file, s, 'utf8');
    return true;
  }
  return false;
}

function main() {
  const candidates = [];
  for (const d of TARGET_DIRS) {
    const dir = path.join(ROOT, d);
    if (!fs.existsSync(dir)) continue;
    const files = walk(dir);
    for (const f of files) {
      const content = fs.readFileSync(f, 'utf8');
      // quick check for 'bg-white' occurrences (non-opacity or paired)
      if (content.includes('bg-white')) candidates.push(f);
    }
  }

  // unique, stable order
  const unique = Array.from(new Set(candidates)).sort();
  const toProcess = unique.slice(0, MAX_FILES);

  const changed = [];
  for (const f of toProcess) {
    try {
      const ok = processFile(f);
      if (ok) changed.push(f);
    } catch (err) {
      console.error('ERROR', f, err.message);
    }
  }

  console.log('Scanned files:', toProcess.length);
  console.log('Files changed:', changed.length);
  if (changed.length) console.log('Changed files:\n' + changed.join('\n'));
}

main();
