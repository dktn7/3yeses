#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function countCharOutsideQuotes(line, ch) {
  let inQuotes = false;
  let escaped = false;
  let count = 0;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '\\' && !escaped) { escaped = true; continue; }
    if (c === '"' && !escaped) inQuotes = !inQuotes;
    if (!inQuotes && c === ch) count++;
    escaped = false;
  }
  return count;
}

function analyzeFile(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const lines = raw.split(/\r?\n/);

  const stack = []; // path stack for object keys
  const map = {}; // map[path][key] = [{line, valueText, valueType}...]

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const keyMatch = line.match(/^\s*"([^"\\]*(?:\\.[^"\\]*)*)"\s*:\s*(.*)$/);
    // approx match for "key": rest
    if (keyMatch) {
      const rawKey = keyMatch[1];
      const key = rawKey.replace(/\\"/g, '"');
      let rest = keyMatch[2].trim();
      // remove trailing comma for easy value capture
      let valueText = rest.replace(/,$/, '').trim();

      const currentPath = stack.join('.') || '$root';
      map[currentPath] = map[currentPath] || {};
      map[currentPath][key] = map[currentPath][key] || [];

      // determine value type
      let valueType = 'primitive';
      if (valueText.startsWith('{')) valueType = 'object';
      else if (valueText.startsWith('[')) valueType = 'array';

      map[currentPath][key].push({ line: i + 1, valueText, valueType });

      // if value starts an object on this line, push key onto stack
      if (valueType === 'object') {
        // count '{' minus '}' on this line to know nesting
        const opens = countCharOutsideQuotes(line, '{');
        const closes = countCharOutsideQuotes(line, '}');
        const net = opens - closes;
        if (net > 0) {
          stack.push(key);
        }
      }
    }

    // adjust stack for lines that open/close objects without a key on the same line
    const opens = countCharOutsideQuotes(line, '{');
    const closes = countCharOutsideQuotes(line, '}');
    const net = opens - closes;
    if (net < 0) {
      // pop for each unmatched closing brace
      for (let k = 0; k < Math.abs(net); k++) {
        if (stack.length > 0) stack.pop();
      }
    }
  }

  // build duplicate list
  const duplicates = [];
  for (const pathKey of Object.keys(map)) {
    for (const key of Object.keys(map[pathKey])) {
      const occ = map[pathKey][key];
      if (occ.length > 1) {
        duplicates.push({ path: pathKey, key, occurrences: occ });
      }
    }
  }

  return { file: filePath, duplicates };
}

function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error('Usage: node scripts/find-duplicate-keys.js <file1.json> [file2.json ...]');
    process.exit(2);
  }

  const results = [];
  for (const file of args) {
    if (!fs.existsSync(file)) {
      console.error('File not found:', file);
      continue;
    }
    try {
      const r = analyzeFile(file);
      results.push(r);
    } catch (err) {
      console.error('Error analyzing', file, err);
    }
  }

  const outDir = path.join('tmp');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, 'locale-duplicates-report.json');
  fs.writeFileSync(outPath, JSON.stringify({ generatedAt: new Date().toISOString(), results }, null, 2), 'utf8');
  console.log('Wrote report to', outPath);
}

if (require.main === module) main();
