const { chromium } = require('playwright');

const base = process.env.TALENT_STUDIO_URL || 'http://localhost:3003';
const email = process.env.TEST_USER_EMAIL || 'test@3yeses.online';
const password = process.env.TEST_USER_PASSWORD || 'Test123!';
const marker = `Profile edit verified ${Date.now()}`;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  let originalProfile = null;

  try {
    await context.addInitScript(() => {
      localStorage.setItem('cookie-consent', JSON.stringify({ necessary: true, preferences: false, statistics: false, marketing: false }));
      localStorage.setItem('theme', 'light');
    });

    const login = await context.request.post(`${base}/api/auth/login`, {
      data: { email, password },
      timeout: 60000,
    });
    assert(login.ok(), `Login failed: ${login.status()}`);

    const profileResponse = await context.request.get(`${base}/api/talent/profile`);
    assert(profileResponse.ok(), `Profile load failed: ${profileResponse.status()}`);
    originalProfile = (await profileResponse.json()).profile;
    assert(originalProfile, 'Test account has no talent profile');

    const verification = await context.request.get(`${base}/api/auth/verify`);
    const currentUser = (await verification.json()).user;

    const page = await context.newPage();
    page.setDefaultTimeout(30000);
    page.setDefaultNavigationTimeout(120000);

    await page.goto(`${base}/en-gb/dashboard/profile`, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle');
    await page.getByRole('heading', { name: 'Your profile' }).waitFor();

    const bio = page.locator('textarea').first();
    const editedBio = `${marker}. ${(originalProfile.bio || '').replace(marker, '')}`.padEnd(70, ' profile');
    await bio.fill(editedBio);

    if (!originalProfile.location) {
      const locationInput = page.getByText('Location', { exact: true }).locator('..').locator('input');
      await locationInput.fill('London, UK');
    }
    if (originalProfile.experienceLevel === null || originalProfile.experienceLevel === undefined) {
      await page.getByRole('button', { name: 'Personal details', exact: true }).click();
      await page.locator('input[type="number"]').last().fill('0');
    }

    const saveResponsePromise = page.waitForResponse(response =>
      response.url().endsWith('/api/talent/profile') && response.request().method() === 'PUT'
    );
    await page.getByRole('button', { name: 'Save Changes', exact: true }).first().click();
    const saveResponse = await saveResponsePromise;
    assert(saveResponse.ok(), `Profile save failed: ${saveResponse.status()} ${await saveResponse.text()}`);
    await page.getByText(/profile updated/i).waitFor();

    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle');
    assert((await page.locator('textarea').first().inputValue()).includes(marker), 'Profile edit disappeared after reload');

    await page.goto(`${base}/en-gb/talent/${currentUser.id}`, { waitUntil: 'domcontentloaded' });
    const skipProfileSetup = page.getByRole('button', { name: 'Skip for now', exact: true });
    if (await skipProfileSetup.waitFor({ timeout: 5000 }).then(() => true).catch(() => false)) {
      await skipProfileSetup.click();
      await skipProfileSetup.waitFor({ state: 'detached', timeout: 5000 }).catch(() => {});
    }
    await page.waitForTimeout(250);
    await page.getByRole('button', { name: /^about$/i }).click();
    await page.getByText(new RegExp(marker)).first().waitFor();

    let settingsResetPayload = null;
    await page.route('**/api/auth/forgot-password', async route => {
      settingsResetPayload = route.request().postDataJSON();
      await route.fulfill({ contentType: 'application/json', body: JSON.stringify({ message: 'Reset email sent' }) });
    });
    await page.goto(`${base}/en-gb/dashboard/settings`, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle');
    await page.getByRole('button', { name: 'Send password reset link', exact: true }).click();
    await page.getByText('Password reset link sent to your account email.', { exact: true }).waitFor();
    assert(settingsResetPayload?.email === currentUser.email, 'Settings reset request used the wrong email');
    await page.unroute('**/api/auth/forgot-password');

    let publicResetPayload = null;
    await page.route('**/api/auth/forgot-password', async route => {
      publicResetPayload = route.request().postDataJSON();
      await route.fulfill({ contentType: 'application/json', body: JSON.stringify({ message: 'Reset email sent' }) });
    });
    await page.goto(`${base}/en-gb/auth/forgot-password`, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle');
    await page.locator('#email').fill(currentUser.email);
    await page.locator('form button[type="submit"]').click();
    await page.locator('h2').waitFor();
    assert(publicResetPayload?.email === currentUser.email, 'Public reset request used the wrong email');
    await page.unroute('**/api/auth/forgot-password');

    const invalidTokenResponse = await context.request.post(`${base}/api/auth/reset-password`, {
      data: { token: 'invalid-production-readiness-token', password: 'Temporary123!' },
    });
    assert(invalidTokenResponse.status() === 400, `Invalid reset token returned ${invalidTokenResponse.status()}`);

    await page.goto(`${base}/en-gb/auth/reset-password`, { waitUntil: 'domcontentloaded' });
    await page.getByRole('heading').filter({ hasText: /invalid/i }).waitFor();

    let resetPayload = null;
    await page.route('**/api/auth/reset-password', async route => {
      resetPayload = route.request().postDataJSON();
      await route.fulfill({ contentType: 'application/json', body: JSON.stringify({ message: 'Password reset successful' }) });
    });
    await page.goto(`${base}/en-gb/auth/reset-password?token=mock-valid-token`, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle');
    await page.locator('#password').fill('Temporary123!');
    await page.locator('#confirmPassword').fill('Temporary123!');
    await page.locator('form button[type="submit"]').click();
    await page.locator('h2').waitFor();
    assert(resetPayload?.token === 'mock-valid-token', 'Reset form omitted its token');
    assert(resetPayload?.password === 'Temporary123!', 'Reset form submitted the wrong password');

    console.log(JSON.stringify({
      passed: true,
      checks: [
        'profile edit through UI',
        'profile persistence after reload',
        'public profile parity',
        'settings reset-email request',
        'public forgot-password request',
        'missing-token state',
        'invalid-token API rejection',
        'reset form payload and success state',
      ],
    }, null, 2));
  } finally {
    if (originalProfile) {
      await context.request.put(`${base}/api/talent/profile`, { data: originalProfile }).catch(() => {});
    }
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
