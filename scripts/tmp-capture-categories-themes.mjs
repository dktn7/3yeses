import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const baseUrl = process.env.BASE_URL || 'http://localhost:3002';
const route = process.env.ROUTE || '/en/categories';
const outDir = path.join(process.cwd(), 'tmp', 'categories-theme-check');

async function capture(theme) {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1600, height: 920 } });

  await page.goto(`${baseUrl}${route}`, { waitUntil: 'domcontentloaded' });
  await page.evaluate((activeTheme) => {
    try {
      localStorage.setItem('theme', activeTheme);
    } catch {}
    if (activeTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, theme);

  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);

  fs.mkdirSync(outDir, { recursive: true });
  const filePath = path.join(outDir, `categories-${theme}.png`);
  await page.screenshot({ path: filePath, fullPage: true });

  await browser.close();
  console.log(filePath);
}

await capture('light');
await capture('dark');
