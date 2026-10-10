const { chromium } = require('playwright');
const path = require('path');

const base = process.env.TALENT_STUDIO_URL || 'http://localhost:3003';
const email = process.env.TEST_USER_EMAIL || 'test@3yeses.online';
const password = process.env.TEST_USER_PASSWORD || 'Test123!';
const runId = Date.now();
const createdTitle = `Talent Studio media ${runId}`;
const editedTitle = `${createdTitle} edited`;
const mediaUrl = `https://picsum.photos/seed/talent-studio-${runId}/1200/900`;
const uploadedTitle = `Talent Studio upload ${runId}`;

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  let createdMediaId = null;

  try {
    await context.addInitScript(() => {
      localStorage.setItem('cookie-consent', JSON.stringify({ necessary: true, preferences: false, statistics: false, marketing: false }));
      localStorage.setItem('theme', 'light');
    });

    const login = await context.request.post(`${base}/api/auth/login`, {
      data: { email, password },
      timeout: 60000,
    });
    if (!login.ok()) throw new Error(`Login failed: ${login.status()}`);

    const verification = await context.request.get(`${base}/api/auth/verify`);
    if (!verification.ok()) throw new Error(`Session verification failed: ${verification.status()}`);
    const { user } = await verification.json();

    const page = await context.newPage();
    page.setDefaultTimeout(30000);
    page.setDefaultNavigationTimeout(120000);

    const browserErrors = [];
    page.on('pageerror', error => browserErrors.push(error.message));

    await page.goto(`${base}/en-gb/dashboard/gallery`, { waitUntil: 'domcontentloaded' });
    await page.getByRole('heading', { name: 'Your gallery' }).waitFor();
    await page.getByRole('button', { name: 'Add media', exact: true }).click();

    const uploadDialog = page.getByRole('dialog');
    await uploadDialog.getByRole('button', { name: /^From a link/ }).click();
    await uploadDialog.locator('input[type="url"]').fill(mediaUrl);

    const createResponsePromise = page.waitForResponse(response =>
      response.url().endsWith('/api/talent/media/upload') && response.request().method() === 'POST'
    );
    await uploadDialog.getByRole('button', { name: 'Add a link', exact: true }).click();
    const createResponse = await createResponsePromise;
    const createBody = await createResponse.json();
    if (!createResponse.ok()) throw new Error(`Media creation failed: ${createResponse.status()} ${JSON.stringify(createBody)}`);
    createdMediaId = createBody.media.id;

    await page.getByText('Media added to your gallery.', { exact: true }).waitFor();
    await page.getByRole('button', { name: 'Edit', exact: true }).first().click();

    const editHeading = page.getByRole('heading', { name: 'Edit media', exact: true });
    await editHeading.waitFor();
    const editModal = editHeading.locator('xpath=ancestor::div[contains(@class,"fixed")]');
    await editModal.locator('input[type="text"]').first().fill(editedTitle);
    await editModal.locator('textarea').fill('Created by the automated Talent Studio production check.');

    const editResponsePromise = page.waitForResponse(response =>
      response.url().includes(`/api/talent/media/${createdMediaId}`) && response.request().method() === 'PATCH'
    );
    await editModal.getByRole('button', { name: 'Save changes', exact: true }).click();
    const editResponse = await editResponsePromise;
    if (!editResponse.ok()) throw new Error(`Media update failed: ${editResponse.status()}`);
    await page.getByText('Changes saved.', { exact: true }).waitFor();
    await page.getByRole('heading', { name: editedTitle, exact: true }).waitFor();

    await page.goto(`${base}/en-gb/talent/${user.id}`, { waitUntil: 'domcontentloaded' });
    await page.getByText(editedTitle, { exact: true }).first().waitFor();

    await page.goto(`${base}/en-gb/dashboard/gallery`, { waitUntil: 'domcontentloaded' });
    const mediaHeading = page.getByRole('heading', { name: editedTitle, exact: true });
    await mediaHeading.waitFor();
    const mediaCardBody = mediaHeading.locator('..');
    await mediaCardBody.getByRole('button', { name: 'Delete', exact: true }).click();
    await page.getByRole('heading', { name: 'Delete media', exact: true }).waitFor();

    const deleteResponsePromise = page.waitForResponse(response =>
      response.url().includes(`/api/talent/media/${createdMediaId}`) && response.request().method() === 'DELETE'
    );
    await page.getByRole('button', { name: 'Delete', exact: true }).last().click();
    const deleteResponse = await deleteResponsePromise;
    if (!deleteResponse.ok()) throw new Error(`Media deletion failed: ${deleteResponse.status()}`);
    createdMediaId = null;
    await page.getByText('Media deleted.', { exact: true }).waitFor();

    await page.getByRole('button', { name: 'Add media', exact: true }).click();
    const fileDialog = page.getByRole('dialog');
    const chooserPromise = page.waitForEvent('filechooser');
    await fileDialog.getByRole('button', { name: /^From your device/ }).click();
    const chooser = await chooserPromise;
    await chooser.setFiles(path.join(process.cwd(), 'public', 'ads', 'ad-photo-3.jpg'));
    await fileDialog.locator('input[type="text"]').first().fill(uploadedTitle);

    const uploadResponsePromise = page.waitForResponse(response =>
      response.url().endsWith('/api/talent/media/upload') && response.request().method() === 'POST',
      { timeout: 60000 }
    );
    await fileDialog.getByRole('button', { name: 'Publish to gallery', exact: true }).click();
    const uploadResponse = await uploadResponsePromise;
    const uploadBody = await uploadResponse.json();
    if (!uploadResponse.ok()) throw new Error(`File upload registration failed: ${uploadResponse.status()} ${JSON.stringify(uploadBody)}`);
    createdMediaId = uploadBody.media.id;
    await page.getByText('Media uploaded.', { exact: true }).waitFor();
    const uploadedHeading = page.getByRole('heading', { name: uploadedTitle, exact: true });
    await uploadedHeading.waitFor();
    await uploadedHeading.locator('..').getByRole('button', { name: 'Delete', exact: true }).click();
    const uploadedDeletePromise = page.waitForResponse(response =>
      response.url().includes(`/api/talent/media/${createdMediaId}`) && response.request().method() === 'DELETE'
    );
    await page.getByRole('button', { name: 'Delete', exact: true }).last().click();
    const uploadedDeleteResponse = await uploadedDeletePromise;
    if (!uploadedDeleteResponse.ok()) throw new Error(`Uploaded media deletion failed: ${uploadedDeleteResponse.status()}`);
    createdMediaId = null;
    await page.getByText('Media deleted.', { exact: true }).waitFor();

    await page.goto(`${base}/en-gb/dashboard/profile`, { waitUntil: 'domcontentloaded' });
    for (const tab of ['Showcase', 'Details', 'Personal details', 'Media links']) {
      await page.getByRole('button', { name: tab, exact: true }).click();
    }

    await page.goto(`${base}/en-gb/dashboard/analytics`, { waitUntil: 'domcontentloaded' });
    for (const range of ['7 Days', '30 Days', '90 Days']) {
      const control = page.getByRole('button', { name: range, exact: true });
      if (await control.count()) await control.click();
    }

    await page.goto(`${base}/en-gb/dashboard/messages`, { waitUntil: 'domcontentloaded' });
    await page.getByRole('tab', { name: /Updates/ }).click();
    await page.getByRole('tab', { name: /Conversations/ }).click();

    if (browserErrors.length) throw new Error(`Browser errors: ${browserErrors.join(' | ')}`);
    console.log(JSON.stringify({
      passed: true,
      checks: [
        'media link creation',
        'media edit',
        'public profile visibility',
        'media deletion',
        'device image upload through ImageKit',
        'profile section switching',
        'analytics range switching',
        'inbox tab switching',
      ],
    }, null, 2));
  } finally {
    if (createdMediaId) {
      await context.request.delete(`${base}/api/talent/media/${createdMediaId}`).catch(() => {});
    }
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
