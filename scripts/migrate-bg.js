const fs = require('fs');
const path = require('path');

const files = [
  'app/[locale]/about/page.tsx',
  'app/[locale]/about/AboutContent.tsx',
  'app/[locale]/categories/SearchResultsPage.tsx',
  'app/[locale]/auth/verify-email/page.tsx',
  'app/[locale]/categories/CategoriesClientNew.tsx',
  'app/[locale]/dashboard/talent/page.tsx',
  'app/[locale]/dashboard/messages/page.tsx',
  'app/[locale]/dashboard/history/page.tsx',
  'app/[locale]/auth/signup/steps/step-3/page.tsx',
  'app/[locale]/dashboard/settings/page.tsx',
  'app/[locale]/dashboard/gallery/page.tsx',
  'app/[locale]/auth/signup/steps/step-2/page.tsx',
  'app/[locale]/dashboard/saved/page.tsx',
  'app/[locale]/dashboard/billing/page.tsx',
  'app/[locale]/auth/signup/steps/step-1/page.tsx',
  'app/[locale]/dashboard/profile/page.tsx',
  'app/[locale]/dashboard/analytics/page.tsx',
  'app/[locale]/dashboard/page.tsx',
  'app/[locale]/dashboard/activity/page.tsx',
  'app/[locale]/dashboard/overview/page.tsx',
];

const root = process.cwd();
let changed = 0;
let touchedFiles = [];

for (const rel of files) {
  const filePath = path.join(root, rel.replace(/\//g, path.sep));
  if (!fs.existsSync(filePath)) continue;
  let s = fs.readFileSync(filePath, 'utf8');
  const original = s;

  // Replace exact non-opacity pairs
  s = s.split('bg-white dark:bg-gray-800').join('bg-light-surface dark:bg-dark-surface');
  s = s.split('bg-white dark:bg-gray-900').join('bg-light-surface dark:bg-dark-surface');
  s = s.split('bg-white dark:bg-gray-700').join('bg-light-surface dark:bg-dark-surface');

  if (s !== original) {
    fs.writeFileSync(filePath, s, 'utf8');
    changed++;
    touchedFiles.push(rel);
  }
}

console.log('files scanned:', files.length);
console.log('files changed:', changed);
if (touchedFiles.length) console.log('touched:', touchedFiles.join(', '));
process.exit(0);
