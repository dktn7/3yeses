import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const baseUrl = process.env.BASE_URL || 'http://localhost:3002';
const pages = [
  '/',
  '/en-gb',
  '/en-gb/why-how',
  '/en-gb/pricing',
  '/en-gb/support',
  '/en-gb/privacy',
  '/en-gb/about',
  '/en-gb/terms'
];

function sanitize(name) {
  return name === '/' ? 'home' : name.replace(/\//g, '_').replace(/^_/, '');
}

async function waitForServer(url, timeout = 20000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      const res = await fetch(url);
      if (res.ok || res.status === 200 || res.status === 302) return true;
    } catch (e) {
      // ignore
    }
    await new Promise(r => setTimeout(r, 500));
  }
  return false;
}

(async () => {
  console.log('Waiting for server at', baseUrl);
  const ok = await waitForServer(baseUrl + '/');
  if (!ok) {
    console.error('Server did not respond in time:', baseUrl);
    process.exit(1);
  }

  const browser = await chromium.launch();

  for (const theme of ['light', 'dark']) {
    const outdir = path.join(process.cwd(), 'test-results', 'visual-snapshots', theme);
    fs.mkdirSync(outdir, { recursive: true });

    for (const p of pages) {
      const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
      await page.emulateMedia({ colorScheme: theme });
      await page.addInitScript((seedTheme) => {
        try {
          localStorage.setItem('theme', seedTheme);
        } catch (e) {
          // ignore storage failures in constrained environments
        }
        document.documentElement.classList.toggle('dark', seedTheme === 'dark');
      }, theme);

      const fullUrl = baseUrl + p;
      console.log('Loading', fullUrl, 'with theme', theme);
      try {
        await page.goto(fullUrl, { waitUntil: 'networkidle' });
        await page.waitForTimeout(600); // allow UI to settle
        const filename = sanitize(p) + '.png';
        const outpath = path.join(outdir, filename);
        await page.screenshot({ path: outpath, fullPage: true });
        console.log('Saved', outpath);
      } catch (err) {
        console.error('Failed to capture', fullUrl, err);
      }

      await page.close();
    }
  }

  await browser.close();
  console.log('Screenshots complete');
})();
