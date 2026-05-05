import { chromium } from 'playwright';

(async () => {
  const url = 'http://localhost:3002/en/about';
  const browser = await chromium.launch();
  const results = {};
  try {
    // 1) system dark (no html.dark added)
    let context = await browser.newContext({ colorScheme: 'dark', viewport: { width: 1280, height: 900 } });
    let page = await context.newPage();
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);
    results.prefersDark = await page.evaluate(() => {
      const htmlClasses = document.documentElement.className || null;
      const hasBrand = !!document.querySelector('.brand-true-red');
      const computed = getComputedStyle(document.documentElement);
      const vars = {
        '--background': computed.getPropertyValue('--background')?.trim() || null,
        '--brand-primary': computed.getPropertyValue('--brand-primary')?.trim() || null,
        '--brand-accent': computed.getPropertyValue('--brand-accent')?.trim() || null,
      };
      const bodyBg = getComputedStyle(document.body).backgroundColor;
      const brandElem = document.querySelector('.brand-true-red');
      const brandBg = brandElem ? getComputedStyle(brandElem).backgroundImage || getComputedStyle(brandElem).backgroundColor : null;
      return { htmlClasses, hasBrand, vars, bodyBg, brandBg };
    });
    await page.close();
    await context.close();

    // 2) forced html.dark
    context = await browser.newContext({ colorScheme: 'dark', viewport: { width: 1280, height: 900 } });
    await context.addInitScript(() => {
      document.documentElement.classList.add('dark');
    });
    page = await context.newPage();
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);
    results.htmlDark = await page.evaluate(() => {
      const htmlClasses = document.documentElement.className || null;
      const hasBrand = !!document.querySelector('.brand-true-red');
      const computed = getComputedStyle(document.documentElement);
      const vars = {
        '--background': computed.getPropertyValue('--background')?.trim() || null,
        '--brand-primary': computed.getPropertyValue('--brand-primary')?.trim() || null,
        '--brand-accent': computed.getPropertyValue('--brand-accent')?.trim() || null,
      };
      const bodyBg = getComputedStyle(document.body).backgroundColor;
      const brandElem = document.querySelector('.brand-true-red');
      const brandBg = brandElem ? getComputedStyle(brandElem).backgroundImage || getComputedStyle(brandElem).backgroundColor : null;
      return { htmlClasses, hasBrand, vars, bodyBg, brandBg };
    });
    await page.close();
    await context.close();

    console.log(JSON.stringify(results, null, 2));
  } catch (err) {
    console.error('ERROR', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
