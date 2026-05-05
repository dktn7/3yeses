import fs from 'fs';
import path from 'path';
import { chromium } from 'playwright';

(async () => {
  const outDir = path.resolve(process.cwd(), 'tmp', 'screenshots');
  await fs.promises.mkdir(outDir, { recursive: true });

  const urls = [
    { name: 'about', url: 'http://localhost:3002/en/about' },
    { name: 'home', url: 'http://localhost:3002/' }
  ];

  const browser = await chromium.launch({ headless: true });
  try {
    for (const mode of ['prefers-dark', 'html-dark']) {
      for (const u of urls) {
        const contextOptions = {
          viewport: { width: 1280, height: 900 },
          colorScheme: 'dark',
        };
        const context = await browser.newContext(contextOptions);
        if (mode === 'html-dark') {
          await context.addInitScript(() => {
            document.documentElement.classList.add('dark');
          });
        }
        const page = await context.newPage();
        try {
          await page.goto(u.url, { waitUntil: 'networkidle', timeout: 30000 });
          // allow client JS to run and next-themes to set classes if needed
          await page.waitForTimeout(1200);
          const file = path.join(outDir, `${u.name}-${mode}.png`);
          await page.screenshot({ path: file, fullPage: true });
          console.log('Saved', file);
        } catch (err) {
          console.error('Error capturing', u.url, err && err.message ? err.message : err);
        }
        await page.close();
        await context.close();
      }
    }
  } finally {
    await browser.close();
  }
})();
