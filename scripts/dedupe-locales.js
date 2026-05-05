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

function analyzeFileForDuplicates(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const lines = raw.split(/\r?\n/);

  const stack = [];
  const map = {};

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const keyMatch = line.match(/^\s*"([^"\\]*(?:\\.[^"\\]*)*)"\s*:\s*(.*)$/);
    if (keyMatch) {
      const rawKey = keyMatch[1];
      const key = rawKey.replace(/\\"/g, '"');
      let rest = keyMatch[2].trim();
      let valueText = rest.replace(/,$/, '').trim();
      const currentPath = stack.join('.') || '$root';
      map[currentPath] = map[currentPath] || {};
      map[currentPath][key] = map[currentPath][key] || [];

      let valueType = 'primitive';
      if (valueText.startsWith('{')) valueType = 'object';
      else if (valueText.startsWith('[')) valueType = 'array';

      map[currentPath][key].push({ line: i + 1, valueText, valueType });

      if (valueType === 'object') {
        const opens = countCharOutsideQuotes(line, '{');
        const closes = countCharOutsideQuotes(line, '}');
        const net = opens - closes;
        if (net > 0) stack.push(key);
      }
    }

    const opens = countCharOutsideQuotes(line, '{');
    const closes = countCharOutsideQuotes(line, '}');
    const net = opens - closes;
    if (net < 0) {
      for (let k = 0; k < Math.abs(net); k++) {
        if (stack.length > 0) stack.pop();
      }
    }
  }

  const duplicates = [];
  for (const pathKey of Object.keys(map)) {
    for (const key of Object.keys(map[pathKey])) {
      const occ = map[pathKey][key];
      if (occ.length > 1) duplicates.push({ path: pathKey, key, occurrences: occ });
    }
  }

  return { lines, duplicates };
}

function findBlockEnd(lines, startIndex) {
  // startIndex is 0-based line index where a '{' occurs
  let depth = 0;
  for (let i = startIndex; i < lines.length; i++) {
    const opens = countCharOutsideQuotes(lines[i], '{');
    const closes = countCharOutsideQuotes(lines[i], '}');
    depth += opens - closes;
    if (depth === 0) return i;
  }
  return lines.length - 1;
}

function dedupeFile(filePath, options) {
  const { lines, duplicates } = analyzeFileForDuplicates(filePath);
  const toRemoveLines = new Set();

  for (const d of duplicates) {
    // keep first occurrence, remove subsequent
    const occ = d.occurrences;
    for (let i = 1; i < occ.length; i++) {
      const lineNo = occ[i].line;
      const idx = lineNo - 1;
      const valueType = occ[i].valueType || occ[i].valueText.startsWith('{') ? 'object' : 'primitive';
      if (valueType === 'primitive') {
        toRemoveLines.add(idx);
      } else if (valueType === 'object') {
        // remove block from idx to matching closing brace
        const end = findBlockEnd(lines, idx);
        for (let j = idx; j <= end; j++) toRemoveLines.add(j);
      } else {
        toRemoveLines.add(idx);
      }
    }
  }

  const outLines = [];
  for (let i = 0; i < lines.length; i++) {
    if (!toRemoveLines.has(i)) outLines.push(lines[i]);
  }

  const outDir = path.join('tmp', 'deduped', path.dirname(filePath));
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join('tmp', 'deduped', filePath);
  fs.writeFileSync(outPath, outLines.join('\n'), 'utf8');

  // create summary
  const summary = {
    file: filePath,
    removedLines: Array.from(toRemoveLines).map(n => n + 1).sort((a,b)=>a-b),
    removedCount: toRemoveLines.size,
    generatedAt: new Date().toISOString()
  };
  return { outPath, summary };
}

function main() {
  const argv = process.argv.slice(2);
  if (argv.length === 0) {
    console.error('Usage: node scripts/dedupe-locales.js [--dry-run] <file1.json> [file2.json ...]');
    process.exit(2);
  }
  const options = { dryRun: false };
  const files = [];
  for (const arg of argv) {
    if (arg === '--dry-run') options.dryRun = true;
    else files.push(arg);
  }
  const results = [];
  for (const file of files) {
    if (!fs.existsSync(file)) {
      console.error('File not found:', file);
      continue;
    }
    const { outPath, summary } = dedupeFile(file, options);
    results.push(summary);
    console.log('Planned dedupe for', file, '->', outPath, '(removed lines:', summary.removedCount + ')');

    if (!options.dryRun) {
      // backup and replace original
      const backupDir = path.join('backup', 'messages');
      fs.mkdirSync(backupDir, { recursive: true });
      const ts = new Date().toISOString().replace(/[:.]/g, '-');
      const backupPath = path.join(backupDir, path.basename(file) + '.bak.' + ts);
      fs.copyFileSync(file, backupPath);
      fs.copyFileSync(outPath, file);
      console.log('Backup created at', backupPath);
    }
  }

  const outDir = path.join('tmp');
  fs.writeFileSync(path.join(outDir, 'deduped', 'summary.json'), JSON.stringify({ generatedAt: new Date().toISOString(), results }, null, 2), 'utf8');
  console.log('Wrote summary to', path.join(outDir, 'deduped', 'summary.json'));
}

if (require.main === module) main();
