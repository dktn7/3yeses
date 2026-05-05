import { chromium } from 'playwright';

(async () => {
  const url = 'http://localhost:3002/en/about';
  const browser = await chromium.launch();
  try {
    const results = {};

    // 1) prefers light
    let ctx = await browser.newContext({ colorScheme: 'light', viewport: { width: 1200, height: 900 } });
    let page = await ctx.newPage();
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(600);
    results.prefersLight = await page.evaluate(() => {
      const header = document.querySelector('header');
      const computedHeader = header ? getComputedStyle(header) : null;
      const doc = getComputedStyle(document.documentElement);
      return {
        htmlClasses: document.documentElement.className || null,
        headerBg: computedHeader ? computedHeader.backgroundColor : null,
        headerBgImage: computedHeader ? computedHeader.backgroundImage : null,
        chromeBgVar: doc.getPropertyValue('--chrome-bg')?.trim() || null,
        backgroundVar: doc.getPropertyValue('--background')?.trim() || null,
        brandContrastInv: doc.getPropertyValue('--brand-contrast-inv')?.trim() || null
      };
    });
    await page.close();
    await ctx.close();

    // 2) prefers dark (no html.dark forced)
    ctx = await browser.newContext({ colorScheme: 'dark', viewport: { width: 1200, height: 900 } });
    page = await ctx.newPage();
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(600);
    results.prefersDark = await page.evaluate(() => {
      const header = document.querySelector('header');
      const computedHeader = header ? getComputedStyle(header) : null;
      const doc = getComputedStyle(document.documentElement);
      return {
        htmlClasses: document.documentElement.className || null,
        headerBg: computedHeader ? computedHeader.backgroundColor : null,
        headerBgImage: computedHeader ? computedHeader.backgroundImage : null,
        chromeBgVar: doc.getPropertyValue('--chrome-bg')?.trim() || null,
        backgroundVar: doc.getPropertyValue('--background')?.trim() || null,
        brandContrastInv: doc.getPropertyValue('--brand-contrast-inv')?.trim() || null
      };
    });
    await page.close();
    await ctx.close();

    // 3) forced html.dark
    ctx = await browser.newContext({ colorScheme: 'dark', viewport: { width: 1200, height: 900 } });
    await ctx.addInitScript(() => { document.documentElement.classList.add('dark'); });
    page = await ctx.newPage();
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(600);
    results.htmlDark = await page.evaluate(() => {
      const header = document.querySelector('header');
      const computedHeader = header ? getComputedStyle(header) : null;
      const doc = getComputedStyle(document.documentElement);
      return {
        htmlClasses: document.documentElement.className || null,
        headerBg: computedHeader ? computedHeader.backgroundColor : null,
        headerBgImage: computedHeader ? computedHeader.backgroundImage : null,
        chromeBgVar: doc.getPropertyValue('--chrome-bg')?.trim() || null,
        backgroundVar: doc.getPropertyValue('--background')?.trim() || null,
        brandContrastInv: doc.getPropertyValue('--brand-contrast-inv')?.trim() || null
      };
    });
    await page.close();
    await ctx.close();

    console.log(JSON.stringify(results, null, 2));
  } catch (err) {
    console.error('ERR', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
