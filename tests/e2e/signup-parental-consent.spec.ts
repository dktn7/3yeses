import { test, expect, Page } from '@playwright/test';

// Test configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:3002';

// Test data generators
const generateEmail = (prefix: string) => `${prefix}-${Date.now()}@test.com`;
const generatePhone = () => `+44 7${Math.floor(Math.random() * 1000000000).toString().padStart(9, '0')}`;

// Helper to fill Step 1 form
async function fillStep1AccountInfo(page: Page, accountData: {
  dateOfBirth: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  password?: string;
  parentFirstName?: string;
  parentLastName?: string;
  parentEmail?: string;
  parentPhone?: string;
  childFirstName?: string;
  childLastName?: string;
  parentName?: string;
  parentContactEmail?: string;
}) {
  // Fill date of birth first
  await page.fill('input[type="date"]', accountData.dateOfBirth);
  await page.waitForTimeout(500); // Wait for age calculation

  // Check if we need to handle age verification screens
  const isUnder13 = await page.getByText(/Parent-Managed Account/i).isVisible().catch(() => false);
  const isTeen13to15 = await page.getByText(/Account Type Selection/i).isVisible().catch(() => false);

  if (isUnder13) {
    // For under 13, there's just an informational message
    await page.waitForTimeout(1000);
  }

  if (isTeen13to15) {
    // Choose account type based on presence of parentFirstName (parent-managed) or parentName (self-managed with consent)
    if (accountData.parentFirstName) {
      await page.getByRole('button', { name: /Parent-Managed Account/i }).click();
    } else if (accountData.parentName) {
      await page.getByRole('button', { name: /Self-Managed Account/i }).click();
    }
    await page.waitForTimeout(500);
  }

  // Wait for the form to be visible after age selection
  await page.waitForTimeout(1000);

  // Fill self-managed account fields (for adults or teens with self-managed)
  if (accountData.firstName) {
    await page.getByPlaceholder('John').fill(accountData.firstName);
  }
  if (accountData.lastName) {
    await page.getByPlaceholder('Doe').fill(accountData.lastName);
  }
  if (accountData.email) {
    await page.getByPlaceholder('your.email@example.com').fill(accountData.email);
  }
  if (accountData.phone) {
    // Phone input might be the CustomPhoneInput component
    const phoneInput = page.locator('input[type="tel"]').first();
    await phoneInput.fill(accountData.phone);
  }

  // Fill parent contact info (for teens with self-managed consent)
  if (accountData.parentName) {
    await page.waitForTimeout(1000); // Wait for parent contact section to appear
    const parentNameInput = page.getByPlaceholder(/Jane Smith|Full name/i);
    await parentNameInput.waitFor({ state: 'visible', timeout: 5000 });
    await parentNameInput.fill(accountData.parentName);
  }
  if (accountData.parentContactEmail) {
    await page.getByPlaceholder('parent@example.com').fill(accountData.parentContactEmail);
  }

  // Fill parent-managed account fields
  if (accountData.parentFirstName) {
    await page.waitForTimeout(1000); // Wait for parent-managed form to fully render
    // Find all text inputs and filter by nearby labels
    const inputs = await page.locator('input[type="text"]').all();
    // Parent first name is typically the first input in parent-managed form
    for (const input of inputs) {
      const placeholder = await input.getAttribute('placeholder');
      if (placeholder && placeholder.includes('John')) {
        await input.fill(accountData.parentFirstName);
        break;
      }
    }
  }
  if (accountData.parentLastName) {
    const inputs = await page.locator('input[type="text"]').all();
    for (const input of inputs) {
      const placeholder = await input.getAttribute('placeholder');
      if (placeholder && placeholder.includes('Doe')) {
        await input.fill(accountData.parentLastName);
        break;
      }
    }
  }
  if (accountData.parentEmail) {
    const emailInputs = await page.locator('input[type="email"]').all();
    if (emailInputs.length > 0) {
      await emailInputs[0].fill(accountData.parentEmail);
    }
  }
  if (accountData.parentPhone) {
    const phoneInputs = await page.locator('input[type="tel"]').all();
    if (phoneInputs.length > 1) {
      await phoneInputs[1].fill(accountData.parentPhone);
    } else if (phoneInputs.length > 0) {
      await phoneInputs[0].fill(accountData.parentPhone);
    }
  }
  if (accountData.childFirstName) {
    const inputs = await page.locator('input[type="text"]').all();
    // Child first name comes after parent fields
    let foundParent = false;
    for (const input of inputs) {
      const placeholder = await input.getAttribute('placeholder');
      const value = await input.inputValue();
      // Skip if already filled (parent name)
      if (value) {
        foundParent = true;
        continue;
      }
      if (foundParent && placeholder && placeholder.includes('John')) {
        await input.fill(accountData.childFirstName);
        break;
      }
    }
  }
  if (accountData.childLastName) {
    const inputs = await page.locator('input[type="text"]').all();
    let foundParent = false;
    let foundChildFirst = false;
    for (const input of inputs) {
      const placeholder = await input.getAttribute('placeholder');
      const value = await input.inputValue();
      if (value) {
        if (!foundParent) {
          foundParent = true;
        } else if (!foundChildFirst) {
          foundChildFirst = true;
        }
        continue;
      }
      if (foundParent && foundChildFirst && placeholder && placeholder.includes('Doe')) {
        await input.fill(accountData.childLastName);
        break;
      }
    }
  }

  // Fill password
  if (accountData.password) {
    const passwordInputs = await page.locator('input[type="password"]').all();
    if (passwordInputs.length >= 2) {
      await passwordInputs[0].fill(accountData.password);
      await passwordInputs[1].fill(accountData.password);
    }
  }

  // Check parental consent if present (for parent-managed accounts)
  await page.waitForTimeout(500);
  const consentCheckboxes = await page.locator('input[type="checkbox"]').all();
  for (const checkbox of consentCheckboxes) {
    const label = await checkbox.locator('..').textContent();
    if (label && /parental consent|confirm.*parent/i.test(label)) {
      await checkbox.check();
      break;
    }
  }

  // Accept terms - usually the last checkbox
  await page.waitForTimeout(500);
  const allCheckboxes = await page.locator('input[type="checkbox"]').all();
  for (const checkbox of allCheckboxes) {
    const label = await checkbox.locator('..').textContent();
    if (label && /terms|conditions|agree/i.test(label)) {
      await checkbox.check();
      break;
    }
  }
}

// Helper to fill Step 2 profile
async function fillStep2Profile(page: Page) {
  // Select category
  await page.selectOption('select:near(:text("Category"))', { index: 1 });
  await page.waitForTimeout(500);

  // Select subcategory if available
  const subcategorySelect = page.locator('select').nth(1); // Second select is subcategory
  if (await subcategorySelect.isVisible().catch(() => false)) {
    const optionCount = await subcategorySelect.locator('option').count();
    if (optionCount > 1) {
      await subcategorySelect.selectOption({ index: 1 });
    }
  }

  // Fill location
  await page.fill('input[placeholder*="City, Country"]', 'London, United Kingdom');
  await page.waitForTimeout(500);
  // Click first suggestion if dropdown appears
  const locationSuggestion = page.locator('[class*="location"] li, [class*="suggestion"] li').first();
  if (await locationSuggestion.isVisible()) {
    await locationSuggestion.click();
  }

  // Select experience
  await page.selectOption('select:near(:text("Experience"))', { index: 1 });

  // Fill bio (optional)
  const bioField = page.locator('textarea[placeholder*="Tell us"]');
  if (await bioField.isVisible()) {
    await bioField.fill('Experienced professional with passion for the craft.');
  }
}

// Helper to upload media in Step 3
async function fillStep3Media(page: Page, checkMediaConsent = false) {
  // Upload profile photo
  const profilePhotoInput = page.locator('input[type="file"]').first();
  await profilePhotoInput.setInputFiles({
    name: 'profile.jpg',
    mimeType: 'image/jpeg',
    buffer: Buffer.from('fake-image-data')
  });

  // Check media consent for parent-managed accounts
  if (checkMediaConsent) {
    await page.waitForTimeout(500);
    const checkboxes = await page.locator('input[type="checkbox"]').all();
    for (const checkbox of checkboxes) {
      const label = await checkbox.locator('..').textContent();
      if (label && /permission to upload|media.*consent/i.test(label)) {
        await checkbox.check();
        break;
      }
    }
  }
}

test.describe('Parental Consent System - Complete Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/signup/steps/step-1`);
  });

  test('Test 1: Adult (16+) - Standard Signup', async ({ page }) => {
    console.log('🧪 Testing: Adult (16+) Standard Signup');

    const testData = {
      dateOfBirth: '2000-01-01',
      firstName: 'John',
      lastName: 'Adult',
      email: generateEmail('adult'),
      phone: generatePhone(),
      password: 'SecurePass123!'
    };

    // Step 1
    await fillStep1AccountInfo(page, testData);
    await page.click('button[type="submit"]');
    
    // Should navigate to Step 2
    await page.waitForURL(/step-2/, { timeout: 10000 });
    console.log('✅ Step 1 passed - Navigated to Step 2');

    // Step 2
    await fillStep2Profile(page);
    await page.click('button[type="submit"]');
    
    // Should navigate to Step 3
    await page.waitForURL(/step-3/, { timeout: 10000 });
    console.log('✅ Step 2 passed - Navigated to Step 3');

    // Step 3
    await fillStep3Media(page);
    await page.click('button[type="submit"]');

    // Should navigate to verification page
    await page.waitForURL(/verify-email/, { timeout: 15000 });
    console.log('✅ Step 3 passed - Account created, redirected to email verification');
    console.log(`📧 Verification email sent to: ${testData.email}`);
  });

  test('Test 2: Teen (13-15) Self-Managed with Parental Consent', async ({ page }) => {
    console.log('🧪 Testing: Teen Self-Managed with Parental Consent');

    const testData = {
      dateOfBirth: '2011-01-01', // 14 years old
      firstName: 'Sarah',
      lastName: 'Teen',
      email: generateEmail('teen'),
      phone: generatePhone(),
      parentName: 'Jane Parent',
      parentContactEmail: generateEmail('parent-consent'),
      password: 'SecurePass123!'
    };

    // Step 1
    await fillStep1AccountInfo(page, testData);
    
    // Should show parental consent notice
    const pageContent = await page.textContent('body');
    expect(pageContent).toMatch(/parental consent|parent.*consent/i);
    console.log('✅ Parental consent notice displayed');

    await page.click('button[type="submit"]');
    await page.waitForURL(/step-2/, { timeout: 10000 });
    console.log('✅ Step 1 passed');

    // Step 2
    await fillStep2Profile(page);
    await page.click('button[type="submit"]');
    await page.waitForURL(/step-3/, { timeout: 10000 });
    console.log('✅ Step 2 passed');

    // Step 3
    await fillStep3Media(page);
    await page.click('button[type="submit"]');

    // Should navigate to consent-pending page
    await page.waitForURL(/consent-pending/, { timeout: 15000 });
    console.log('✅ Step 3 passed - Account created, waiting for parental consent');
    console.log(`📧 Consent email sent to: ${testData.parentContactEmail}`);
  });

  test('Test 3: Teen (13-15) Parent-Managed Account', async ({ page }) => {
    console.log('🧪 Testing: Teen Parent-Managed Account');

    const testData = {
      dateOfBirth: '2012-01-01', // 13 years old
      parentFirstName: 'Robert',
      parentLastName: 'Guardian',
      parentEmail: generateEmail('parent-managed'),
      parentPhone: generatePhone(),
      childFirstName: 'Emily',
      childLastName: 'Teen',
      password: 'SecurePass123!'
    };

    // Step 1
    await fillStep1AccountInfo(page, testData);
    
    // Should show parent-managed account info
    const step1Content = await page.textContent('body');
    expect(step1Content).toMatch(/Parent-Managed Account|parent.*managed/i);
    console.log('✅ Parent-managed account info displayed');

    // Wait for form to be fully ready
    await page.waitForTimeout(1000);
    
    // Scroll to submit button to ensure it's visible
    await page.locator('button[type="submit"]').scrollIntoViewIfNeeded();
    
    await page.click('button[type="submit"]');
    await page.waitForURL(/step-2/, { timeout: 15000 });
    console.log('✅ Step 1 passed');

    // Step 2 - Should show child's profile context
    const step2Content = await page.textContent('body');
    expect(step2Content).toContain(testData.childFirstName);
    console.log('✅ Child name banner displayed in Step 2');

    await fillStep2Profile(page);
    await page.click('button[type="submit"]');
    await page.waitForURL(/step-3/, { timeout: 10000 });
    console.log('✅ Step 2 passed');

    // Step 3 - Should show media consent checkbox
    const step3Content = await page.textContent('body');
    expect(step3Content).toContain(testData.childFirstName);
    expect(step3Content).toMatch(/permission to upload|media.*consent/i);
    console.log('✅ Child name banner and media consent displayed in Step 3');

    await fillStep3Media(page, true); // Check media consent
    await page.click('button[type="submit"]');

    // Should navigate to verification page (parent's email)
    await page.waitForURL(/verify-email/, { timeout: 15000 });
    console.log('✅ Step 3 passed - Account created, redirected to email verification');
    console.log(`📧 Verification email sent to parent: ${testData.parentEmail}`);
  });

  test('Test 4: Child (Under 13) Parent-Managed Account', async ({ page }) => {
    console.log('🧪 Testing: Child Under 13 Parent-Managed Account');

    const testData = {
      dateOfBirth: '2015-01-01', // 10 years old
      parentFirstName: 'Michael',
      parentLastName: 'Parent',
      parentEmail: generateEmail('child-parent'),
      parentPhone: generatePhone(),
      childFirstName: 'Tommy',
      childLastName: 'Child',
      password: 'SecurePass123!'
    };

    // Step 1
    await fillStep1AccountInfo(page, testData);
    
    // Should show under-13 message
    const step1Content = await page.textContent('body');
    expect(step1Content).toMatch(/under 13|parent.*managed/i);
    console.log('✅ Under-13 message displayed');

    // Wait for form to be fully ready
    await page.waitForTimeout(1000);
    
    // Scroll to submit button to ensure it's visible
    await page.locator('button[type="submit"]').scrollIntoViewIfNeeded();

    await page.click('button[type="submit"]');
    await page.waitForURL(/step-2/, { timeout: 15000 });
    console.log('✅ Step 1 passed');

    // Step 2
    const step2Content = await page.textContent('body');
    expect(step2Content).toContain(testData.childFirstName);
    console.log('✅ Child name banner displayed in Step 2');

    await fillStep2Profile(page);
    await page.click('button[type="submit"]');
    await page.waitForURL(/step-3/, { timeout: 10000 });
    console.log('✅ Step 2 passed');

    // Step 3
    const step3Content = await page.textContent('body');
    expect(step3Content).toContain(testData.childFirstName);
    expect(step3Content).toMatch(/permission to upload|media.*consent/i);
    console.log('✅ Media consent checkbox displayed in Step 3');

    await fillStep3Media(page, true);
    await page.click('button[type="submit"]');

    await page.waitForURL(/verify-email/, { timeout: 15000 });
    console.log('✅ Step 3 passed - Account created');
    console.log(`📧 Verification email sent to parent: ${testData.parentEmail}`);
  });
});

test.describe('Validation Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/signup/steps/step-1`);
  });

  test('Should validate minimum age requirement', async ({ page }) => {
    console.log('🧪 Testing: Minimum age validation');

    // Try to enter age under 13
    await page.fill('input[type="date"]', '2020-01-01'); // 5 years old
    await page.waitForTimeout(1000);

    // Should show parent-managed requirement message somewhere on the page
    const pageContent = await page.textContent('body');
    expect(pageContent).toContain('Parent');
    console.log('✅ Minimum age validation working');
  });

  test('Should validate email format', async ({ page }) => {
    console.log('🧪 Testing: Email validation');

    await page.fill('input[type="date"]', '2000-01-01');
    await page.waitForTimeout(1000);
    
    await page.getByPlaceholder('John').fill('Test');
    await page.getByPlaceholder('Doe').fill('User');
    await page.getByPlaceholder('your.email@example.com').fill('invalid-email');
    
    const passwordInputs = await page.locator('input[type="password"]').all();
    await passwordInputs[0].fill('Pass123!');
    await passwordInputs[1].fill('Pass123!');
    
    // Check terms checkbox
    const checkboxes = await page.locator('input[type="checkbox"]').all();
    for (const checkbox of checkboxes) {
      const label = await checkbox.locator('..').textContent();
      if (label && /terms/i.test(label)) {
        await checkbox.check();
        break;
      }
    }

    await page.click('button[type="submit"]');
    await page.waitForTimeout(1000);

    // Should show email error somewhere
    const pageContent = await page.textContent('body');
    expect(pageContent).toMatch(/valid.*email|email.*valid|invalid.*email/i);
    console.log('✅ Email validation working');
  });

  test('Should validate password match', async ({ page }) => {
    console.log('🧪 Testing: Password match validation');

    await page.fill('input[type="date"]', '2000-01-01');
    await page.waitForTimeout(1000);
    
    await page.getByPlaceholder('John').fill('Test');
    await page.getByPlaceholder('Doe').fill('User');
    await page.getByPlaceholder('your.email@example.com').fill('test@example.com');
    
    const passwordInputs = await page.locator('input[type="password"]').all();
    await passwordInputs[0].fill('Password123!');
    await passwordInputs[1].fill('DifferentPass123!');
    
    // Check terms checkbox
    const checkboxes = await page.locator('input[type="checkbox"]').all();
    for (const checkbox of checkboxes) {
      const label = await checkbox.locator('..').textContent();
      if (label && /terms/i.test(label)) {
        await checkbox.check();
        break;
      }
    }

    await page.click('button[type="submit"]');
    await page.waitForTimeout(1000);

    // Should show password mismatch error
    const pageContent = await page.textContent('body');
    expect(pageContent).toMatch(/do not match|passwords.*match|password.*mismatch/i);
    console.log('✅ Password match validation working');
  });

  test('Should require parental consent checkbox for parent-managed accounts', async ({ page }) => {
    console.log('🧪 Testing: Parental consent checkbox validation');

    const testData = {
      dateOfBirth: '2015-01-01',
      parentFirstName: 'Test',
      parentLastName: 'Parent',
      parentEmail: generateEmail('consent-test'),
      childFirstName: 'Test',
      childLastName: 'Child',
      password: 'SecurePass123!'
    };

    await fillStep1AccountInfo(page, testData);
    
    // Uncheck parental consent if checked
    await page.waitForTimeout(500);
    const checkboxes = await page.locator('input[type="checkbox"]').all();
    for (const checkbox of checkboxes) {
      const label = await checkbox.locator('..').textContent();
      if (label && /parental consent|confirm.*parent/i.test(label)) {
        if (await checkbox.isChecked()) {
          await checkbox.uncheck();
        }
        break;
      }
    }

    await page.click('button[type="submit"]');
    await page.waitForTimeout(1000);

    // Should show consent error
    const pageContent = await page.textContent('body');
    expect(pageContent).toMatch(/must confirm|consent.*required|confirm.*consent/i);
    console.log('✅ Parental consent validation working');
  });
});
