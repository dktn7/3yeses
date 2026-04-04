const fs = require('fs');
const path = require('path');

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function deepMergeTemplate(template, target) {
  let added = 0;
  function recurse(tpl, tgt) {
    if (typeof tpl !== 'object' || tpl === null) return;
    if (typeof tgt !== 'object' || tgt === null) return;
    for (const key of Object.keys(tpl)) {
      if (!(key in tgt)) {
        tgt[key] = tpl[key];
        added++;
      } else {
        if (typeof tpl[key] === 'object' && tpl[key] !== null) {
          if (typeof tgt[key] !== 'object' || tgt[key] === null) {
            tgt[key] = tpl[key];
            added++;
          } else {
            recurse(tpl[key], tgt[key]);
          }
        }
      }
    }
  }
  recurse(template, target);
  return added;
}

function main() {
  const messagesDir = path.join(__dirname, '..', 'messages');
  const files = fs.readdirSync(messagesDir).filter(f => f.endsWith('.json'));
  const enPath = path.join(messagesDir, 'en.json');
  if (!fs.existsSync(enPath)) {
    console.error('Reference en.json not found in messages/');
    process.exit(1);
  }
  const en = readJson(enPath);

  const report = {};

  for (const file of files) {
    if (file === 'en.json') continue;
    const fp = path.join(messagesDir, file);
    let localeJson;
    try {
      localeJson = readJson(fp);
    } catch (err) {
      console.error('Failed to parse', file, err.message);
      continue;
    }

    const added = deepMergeTemplate(en, localeJson);
    if (added > 0) {
      fs.writeFileSync(fp, JSON.stringify(localeJson, null, 2) + '\n', 'utf8');
    }
    report[file] = added;
  }

  console.log('Merge complete. Summary (added keys):');
  for (const k of Object.keys(report)) {
    console.log(`- ${k}: ${report[k]}`);
  }
}

if (require.main === module) main();
