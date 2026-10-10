const { chromium } = require('playwright');

const base = process.env.TALENT_STUDIO_URL || 'http://localhost:3003';
const email = process.env.TEST_USER_EMAIL || 'test@3yeses.online';
const password = process.env.TEST_USER_PASSWORD || 'Test123!';
const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScL/nwAAAABJRU5ErkJggg==', 'base64');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    for (const theme of ['light', 'dark']) {
      const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
      await context.addInitScript(value => {
        localStorage.setItem('theme', value);
        localStorage.setItem('cookie-consent', JSON.stringify({ necessary: true }));
      }, theme);
      const login = await context.request.post(`${base}/api/auth/login`, { data: { email, password } });
      assert(login.ok(), `Login failed: ${login.status()}`);

      const history = await (await context.request.get(`${base}/api/dashboard/view-history`)).json();
      const repeatedId = history.talents.map(talent => talent.id).find((id, index, ids) => ids.indexOf(id) !== index);
      const page = await context.newPage();
      const keyWarnings = [];
      page.on('console', message => {
        if (message.text().includes('same key')) keyWarnings.push(message.text());
      });
      await page.goto(`${base}/en-gb/dashboard/overview`, { waitUntil: 'domcontentloaded' });
      await page.getByRole('heading', { name: /Welcome back/ }).waitFor();
      await page.getByRole('button', { name: /Change language/ }).click();
      await page.getByRole('button', { name: 'Français' }).waitFor();
      await page.getByRole('button', { name: /Change language/ }).click();
      await page.getByRole('button', { name: 'Open account menu' }).click();
      for (const label of ['Dashboard', 'Profile', 'Gallery', 'Insights', 'Activity', 'Messages', 'Settings', 'Help & Support']) {
        assert(await page.getByText(label, { exact: true }).count() > 0, `Account menu is missing ${label}`);
      }
      await page.getByRole('button', { name: 'Open account menu' }).click();
      await page.getByText('Next priority', { exact: true }).waitFor();
      await page.getByRole('link', { name: 'Change profile picture' }).click();
      await page.getByRole('heading', { name: 'Your profile', exact: true }).waitFor();
      assert(page.url().includes('#profile-headshot'), 'Profile picture did not open the headshot editor');
      await page.goBack();
      await page.getByRole('heading', { name: /Welcome back/ }).waitFor();
      await page.setViewportSize({ width: 390, height: 844 });
      const mobileHasOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
      assert(!mobileHasOverflow, `${theme} dashboard header overflows on mobile`);
      await page.setViewportSize({ width: 1440, height: 900 });
      const background = await page.locator('.dashboard-content').evaluate(element => getComputedStyle(element).backgroundImage);
      assert(background.includes('linear-gradient'), `${theme} studio background did not render`);
      if (repeatedId) {
        const recentPanel = page.getByRole('heading', { name: 'Recently viewed' }).locator('xpath=ancestor::*[contains(@class,"dashboard-surface")]');
        assert(await recentPanel.locator(`a[href*="/talent/${repeatedId}"]`).count() <= 1, 'Overview repeats the same recently viewed talent');
      }
      assert(keyWarnings.length === 0, `Duplicate React keys: ${keyWarnings.join(' | ')}`);

      await page.route('**/api/imagekit/auth', route => route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({ token: 'test-token', expire: Math.floor(Date.now() / 1000) + 1800, signature: 'test-signature', publicKey: 'public_test' }),
      }));
      let uploads = 0;
      await page.route('**/api/v1/files/upload', route => {
        uploads += 1;
        return route.fulfill({ contentType: 'application/json', body: JSON.stringify({ url: `https://example.com/mock-profile-${uploads}.png`, fileId: `mock-${uploads}` }) });
      });
      await page.goto(`${base}/en-gb/dashboard/profile`, { waitUntil: 'domcontentloaded' });
      await page.getByRole('heading', { name: 'Your profile' }).waitFor();
      const inputs = page.locator('input[type="file"][accept="image/*"]');
      assert(await inputs.count() === 2, 'Headshot and cover upload controls are not both available');
      await inputs.first().setInputFiles({ name: 'headshot.png', mimeType: 'image/png', buffer: png });
      await inputs.last().setInputFiles({ name: 'cover.png', mimeType: 'image/png', buffer: png });
      await page.getByText('Use an image link instead').click();
      await page.waitForFunction(() => {
        const values = [...document.querySelectorAll('input[placeholder="https://..."]')].map(input => input.value);
        return values[0]?.includes('mock-profile-') && values[1]?.includes('mock-profile-');
      });
      assert(uploads === 2, `Expected two mocked uploads, got ${uploads}`);
      assert(await page.getByRole('button', { name: 'Complete Upload' }).count() === 0, 'Profile photo uploads still require a second completion step');
      await context.close();
    }
    console.log(JSON.stringify({ passed: true, checks: ['language and account dropdown options', 'purpose-led profile readiness panel', 'mobile header overflow', 'unique overview visits', 'vibrant light and dark backgrounds', 'headshot and cover auto-completion without persistence'] }, null, 2));
  } finally {
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
