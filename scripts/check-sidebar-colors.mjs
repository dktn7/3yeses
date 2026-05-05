import { chromium } from 'playwright';

(async () => {
  const url = 'http://localhost:3002/en/about';
  const browser = await chromium.launch();
  try {
    const context = await browser.newContext({ colorScheme: 'dark', viewport: { width: 1200, height: 900 } });
    await context.addInitScript(() => {
      // ensure next-themes can set 'dark' if it wants; also keep it simple
      // but do not force html.dark unless asked; we're checking computed currently
    });
    const page = await context.newPage();
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);

    const res = await page.evaluate(() => {
      const headerLink = document.querySelector('header a');
      const firstSidebarLink = document.querySelector('aside nav a');
      const headerColor = headerLink ? getComputedStyle(headerLink).color : null;
      const sidebarColor = firstSidebarLink ? getComputedStyle(firstSidebarLink).color : null;
      const htmlClasses = document.documentElement.className || null;
      const brandPrimary = getComputedStyle(document.documentElement).getPropertyValue('--brand-primary')?.trim() || null;
      return { htmlClasses, headerColor, sidebarColor, brandPrimary };
    });

    console.log(JSON.stringify(res, null, 2));
    await page.close();
    await context.close();
  } catch (err) {
    console.error('ERR', err);
  } finally {
    await browser.close();
  }
})();
