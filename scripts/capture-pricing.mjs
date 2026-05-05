import { chromium } from 'playwright';

const URL = process.env.URL || 'http://localhost:3002/en-gb/pricing';
const OUT = process.env.OUT || 'test-results/pricing-screenshot.png';

async function waitAndCapture() {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1200, height: 1000 } });
  const page = await context.newPage();

  const maxAttempts = 40;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const resp = await page.goto(URL, { waitUntil: 'networkidle', timeout: 10000 });
      if (resp && resp.status() >= 200 && resp.status() < 400) {
        await page.screenshot({ path: OUT, fullPage: true });
        console.log('OK', OUT);
        await browser.close();
        return 0;
      }
    } catch (err) {
      // ignore and retry
    }
    const delay = 1000;
    console.log(`Waiting for server (${attempt}/${maxAttempts})...`);
    await new Promise(r => setTimeout(r, delay));
  }

  console.error('Failed to load page within timeout');
  await browser.close();
  return 1;
}

waitAndCapture().then(code => process.exit(code)).catch(err => { console.error(err); process.exit(1); });
