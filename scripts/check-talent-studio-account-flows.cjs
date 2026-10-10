const { chromium } = require('playwright');

const base = process.env.TALENT_STUDIO_URL || 'http://localhost:3003';
const email = process.env.TEST_USER_EMAIL || 'test@3yeses.online';
const password = process.env.TEST_USER_PASSWORD || 'Test123!';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  let originalSettings = null;
  let targetId = null;
  let originalLikeState = null;

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

    const settingsResponse = await context.request.get(`${base}/api/user/settings`);
    assert(settingsResponse.ok(), `Settings load failed: ${settingsResponse.status()}`);
    originalSettings = (await settingsResponse.json()).settings;
    const changedSettings = JSON.parse(JSON.stringify(originalSettings));
    changedSettings.notifications.marketing = !Boolean(changedSettings.notifications.marketing);

    const settingsUpdate = await context.request.put(`${base}/api/user/settings`, { data: changedSettings });
    assert(settingsUpdate.ok(), `Settings update failed: ${settingsUpdate.status()}`);
    const savedSettings = (await (await context.request.get(`${base}/api/user/settings`)).json()).settings;
    assert(savedSettings.notifications.marketing === changedSettings.notifications.marketing, 'Settings did not persist');

    const talentSearch = await context.request.get(`${base}/api/talent/search?limit=5`);
    assert(talentSearch.ok(), `Talent search failed: ${talentSearch.status()}`);
    const talents = (await talentSearch.json()).talents || [];
    const verification = await context.request.get(`${base}/api/auth/verify`);
    const currentUserId = (await verification.json()).user.id;
    const target = talents.find(talent => talent.id !== currentUserId);
    assert(target, 'No talent available for Saved checks');
    targetId = target.id;

    const likeStatus = await context.request.get(`${base}/api/talent/${targetId}/like`);
    assert(likeStatus.ok(), `Like status failed: ${likeStatus.status()}`);
    originalLikeState = Boolean((await likeStatus.json()).isLiked);
    const idempotentLike = await context.request.post(`${base}/api/talent/${targetId}/like`, {
      data: { like: originalLikeState },
    });
    assert(idempotentLike.ok(), `Like endpoint failed: ${idempotentLike.status()}`);

    const savedResponse = await context.request.get(`${base}/api/dashboard/saved-talents`);
    assert(savedResponse.ok(), `Saved talent load failed: ${savedResponse.status()}`);
    const savedTalents = (await savedResponse.json()).talents || [];
    assert(savedTalents.some(talent => talent.id === targetId) === originalLikeState, 'Saved page data disagrees with like status');

    const historyResponse = await context.request.get(`${base}/api/dashboard/view-history?timeZone=Europe/London`);
    assert(historyResponse.ok(), `History load failed: ${historyResponse.status()}`);
    const historyTalents = (await historyResponse.json()).talents;
    assert(Array.isArray(historyTalents), 'History response has no talent list');
    assert(historyTalents.every(talent => talent.viewId), 'History events need stable visit IDs');
    assert(new Set(historyTalents.map(talent => talent.viewId)).size === historyTalents.length, 'History visit IDs are not unique');
    assert(historyTalents.every(talent => talent.viewedDay), 'History entries need a viewer-local day');
    const talentDays = historyTalents.map(talent => `${talent.id}:${talent.viewedDay}`);
    assert(new Set(talentDays).size === talentDays.length, 'History contains duplicate visits for the same talent on the same day');


    const page = await context.newPage();
    page.setDefaultTimeout(30000);
    page.setDefaultNavigationTimeout(120000);
    const browserErrors = [];
    page.on('pageerror', error => browserErrors.push(error.message));
    page.on('console', message => {
      if (message.type() === 'error' && message.text().includes('same key')) browserErrors.push(message.text());
    });

    await page.goto(`${base}/en-gb/dashboard/overview`, { waitUntil: 'domcontentloaded' });
    await page.getByRole('heading', { name: /Welcome back/ }).waitFor();
    await page.getByRole('heading', { name: 'Recent profiles' }).waitFor();

    await page.goto(`${base}/en-gb/dashboard/settings`, { waitUntil: 'domcontentloaded' });
    await page.getByRole('heading', { name: 'Account settings' }).waitFor();
    const saveSettingsResponse = page.waitForResponse(response =>
      response.url().endsWith('/api/user/settings') && response.request().method() === 'PUT'
    );
    await page.getByRole('button', { name: 'Save Settings', exact: true }).click();
    assert((await saveSettingsResponse).ok(), 'Settings UI save failed');
    await page.getByText('Settings saved successfully!', { exact: true }).waitFor();

    await page.goto(`${base}/en-gb/dashboard/saved`, { waitUntil: 'domcontentloaded' });
    await page.getByRole('heading', { name: 'Saved Talents' }).waitFor();
    const savedControls = page.locator('[role="group"] button, [role="tablist"] button');
    for (let index = 0; index < await savedControls.count(); index += 1) await savedControls.nth(index).click();

    await page.goto(`${base}/en-gb/dashboard/history`, { waitUntil: 'domcontentloaded' });
    await page.getByRole('heading', { name: 'View History' }).waitFor();
    const historyControls = page.locator('[role="group"] button, [role="tablist"] button');
    for (let index = 0; index < await historyControls.count(); index += 1) await historyControls.nth(index).click();

    let supportPayload = null;
    await page.route('**/api/support/tickets', async route => {
      if (route.request().method() !== 'POST') return route.continue();
      supportPayload = route.request().postDataJSON();
      await route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify({ success: true, ticketId: 'TEST-READY' }) });
    });
    await page.goto(`${base}/en-gb/support/submit-ticket`, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle');
    await page.locator('#ticket-subject').fill('Production readiness check');
    await page.locator('#ticket-message').fill('This automated support form check verifies the complete submission state.');
    await page.getByRole('button', { name: 'Submit Ticket', exact: true }).click();
    await page.getByRole('heading', { name: 'Ticket Submitted', exact: true }).waitFor();
    assert(supportPayload?.subject === 'Production readiness check', `Support subject payload was incorrect: ${JSON.stringify(supportPayload)}`);
    assert(supportPayload?.message.includes('automated support form'), `Support message payload was incorrect: ${JSON.stringify(supportPayload)}`);
    await page.unroute('**/api/support/tickets');

    await page.goto(`${base}/en-gb/dashboard/tickets`, { waitUntil: 'domcontentloaded' });
    await page.getByRole('heading', { name: 'Inbox' }).waitFor();
    for (const filter of ['All', 'Open', 'In Progress', 'Resolved', 'Closed']) {
      const button = page.getByRole('button', { name: new RegExp(`^${filter}`) });
      if (await button.count()) await button.first().click();
    }

    await page.route('**/api/payments/history**', route => route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ error: 'test failure' }) }));
    await page.goto(`${base}/en-gb/dashboard/billing`, { waitUntil: 'domcontentloaded' });
    const billingRetry = page.getByRole('button', { name: /try again/i });
    await billingRetry.waitFor();
    await page.unroute('**/api/payments/history**');
    await billingRetry.click();
    await billingRetry.waitFor({ state: 'hidden' });
    await page.getByRole('button', { name: /Manage Subscription/i }).click();
    await page.waitForURL('**/en-gb/dashboard/subscription');

    let checkoutPayload = null;
    await page.route('**/api/subscription/current', route => route.fulfill({ contentType: 'application/json', body: JSON.stringify({ plan: null, status: 'NONE' }) }));
    await page.route('**/api/subscription/create-checkout', async route => {
      checkoutPayload = route.request().postDataJSON();
      await route.fulfill({ contentType: 'application/json', body: JSON.stringify({ url: `${base}/en-gb/dashboard/subscription/success?session_id=mock` }) });
    });
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: /^Subscribe with Stripe:/ }).click();
    await page.waitForURL('**/en-gb/dashboard/subscription/success?session_id=mock');
    assert(checkoutPayload?.locale === 'en-gb', 'Checkout did not include the active locale');
    assert(['6_months', '12_months'].includes(checkoutPayload?.duration), 'Checkout duration was invalid');
    await page.unroute('**/api/subscription/create-checkout');
    await page.unroute('**/api/subscription/current');

    let cancellationRequested = false;
    await page.route('**/api/subscription/current', route => route.fulfill({ contentType: 'application/json', body: JSON.stringify({ plan: 'STANDARD', status: 'ACTIVE', currentPeriodEnd: '2027-01-01T00:00:00.000Z' }) }));
    await page.route('**/api/subscription/cancel', async route => {
      cancellationRequested = true;
      await route.fulfill({ contentType: 'application/json', body: JSON.stringify({ message: 'Cancellation scheduled' }) });
    });
    await page.goto(`${base}/en-gb/dashboard/subscription`, { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: 'Cancel Subscription', exact: true }).click();
    await page.getByRole('button', { name: 'Keep subscription', exact: true }).click();
    await page.getByRole('button', { name: 'Cancel Subscription', exact: true }).click();
    await page.getByRole('button', { name: 'Cancel Subscription', exact: true }).last().click();
    await page.getByRole('status').waitFor();
    assert(cancellationRequested, 'Subscription cancellation request was not sent');

    if (browserErrors.length) throw new Error(`Browser errors: ${browserErrors.join(' | ')}`);
    console.log(JSON.stringify({
      passed: true,
      checks: [
        'settings persistence and UI save',
        'saved talent and like-state parity',
        'history API and filters',
        'unique visit identity on overview',
        'support form payload and success state',
        'ticket status filters',
        'billing error and retry',
        'localized Stripe checkout payload',
        'subscription cancellation confirmation states',
      ],
    }, null, 2));
  } finally {
    if (originalSettings) {
      await context.request.put(`${base}/api/user/settings`, { data: originalSettings }).catch(() => {});
    }
    if (targetId !== null && originalLikeState !== null) {
      await context.request.post(`${base}/api/talent/${targetId}/like`, { data: { like: originalLikeState } }).catch(() => {});
    }
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
