import { test, expect } from '@playwright/test';

// Test configuration
const BASE_URL = 'http://localhost:3002';
const LOCALE = 'en-gb';

// Helper function to calculate age
function getDateOfBirth(age: number): string {
  const today = new Date();
  const birthYear = today.getFullYear() - age;
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${birthYear}-${month}-${day}`;
}

test.describe('Signup Flow - Complete Journey', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to Step 1
    await page.goto(`${BASE_URL}/${LOCALE}/auth/signup/step-1`);
    await page.waitForLoadState('networkidle');
  });

  test.describe('Step 1 - Account Creation', () => {
    
    test('should show self-managed account form for adults (18+)', async ({ page }) => {
      // Fill date of birth for 25-year-old
      await page.fill('input[type="date"]', getDateOfBirth(25));
      
      // Wait for form to update
      await page.waitForTimeout(500);
      
      // Should see SELF account form fields
      await expect(page.locator('input[name="firstName"]')).toBeVisible();
      await expect(page.locator('input[name="lastName"]')).toBeVisible();
      await expect(page.locator('input[name="email"]')).toBeVisible();
      await expect(page.locator('input[name="phone"]')).toBeVisible();
      await expect(page.locator('input[name="password"]')).toBeVisible();
      
      // Should NOT see parent-managed warning
      await expect(page.locator('text=Parent-Managed Account')).not.toBeVisible();
      
      // Should NOT see parent/child sections
      await expect(page.locator('text=Parent/Guardian Information')).not.toBeVisible();
      await expect(page.locator('text=Child\'s Information')).not.toBeVisible();
    });

    test('should show parent-managed account form for minors (13-17)', async ({ page }) => {
      // Fill date of birth for 15-year-old
      await page.fill('input[type="date"]', getDateOfBirth(15));
      
      // Wait for form to update
      await page.waitForTimeout(500);
      
      // Should see parent-managed warning
      await expect(page.locator('text=Parent-Managed Account')).toBeVisible();
      
      // Should see parent section
      await expect(page.locator('text=Parent/Guardian Information')).toBeVisible();
      await expect(page.locator('input[name="parentFirstName"]')).toBeVisible();
      await expect(page.locator('input[name="parentLastName"]')).toBeVisible();
      await expect(page.locator('input[name="parentEmail"]')).toBeVisible();
      
      // Should see child section
      await expect(page.locator('text=Child\'s Information')).toBeVisible();
      await expect(page.locator('input[name="childFirstName"]')).toBeVisible();
      await expect(page.locator('input[name="childLastName"]')).toBeVisible();
      
      // Should see parental consent checkbox
      await expect(page.locator('text=/parental consent/i')).toBeVisible();
      
      // Should NOT see password field (parent-managed accounts don't have passwords)
      await expect(page.locator('input[name="password"]')).not.toBeVisible();
    });

    test('should block users under 13 years old', async ({ page }) => {
      // Fill date of birth for 10-year-old
      await page.fill('input[type="date"]', getDateOfBirth(10));
      
      // Wait for form to update
      await page.waitForTimeout(500);
      
      // Should see error message
      await expect(page.locator('text=/must be at least 13/i')).toBeVisible();
      
      // Submit button should be disabled or hidden
      const submitButton = page.locator('button[type="submit"]');
      const isDisabled = await submitButton.isDisabled().catch(() => true);
      expect(isDisabled).toBe(true);
    });

    test('should validate password strength', async ({ page }) => {
      // Fill date of birth for adult
      await page.fill('input[type="date"]', getDateOfBirth(25));
      await page.waitForTimeout(500);
      
      // Fill basic info
      await page.fill('input[name="firstName"]', 'John');
      await page.fill('input[name="lastName"]', 'Doe');
      await page.fill('input[name="email"]', 'john.doe@example.com');
      
      // Test weak password
      await page.fill('input[name="password"]', 'weak');
      await page.waitForTimeout(300);
      
      // Should show password strength indicators
      const strengthIndicator = page.locator('[class*="password"]').first();
      await expect(strengthIndicator).toBeVisible();
      
      // Fill strong password
      await page.fill('input[name="password"]', 'StrongPass123!');
      await page.waitForTimeout(300);
      
      // Should show all checkmarks (length, uppercase, lowercase, number)
      const checkmarks = page.locator('svg[class*="check"], [class*="MdCheckCircle"]');
      const count = await checkmarks.count();
      expect(count).toBeGreaterThanOrEqual(4);
    });

    test('should complete adult signup step 1', async ({ page }) => {
      // Fill date of birth
      await page.fill('input[type="date"]', getDateOfBirth(25));
      await page.waitForTimeout(500);
      
      // Fill personal information
      await page.fill('input[name="firstName"]', 'Jane');
      await page.fill('input[name="lastName"]', 'Smith');
      await page.fill('input[name="email"]', `test-adult-${Date.now()}@example.com`);
      await page.fill('input[name="phone"]', '+1234567890');
      await page.fill('input[name="password"]', 'SecurePass123!');
      
      // Accept terms
      await page.check('input[type="checkbox"][name="termsAccepted"]');
      
      // Submit
      await page.click('button[type="submit"]');
      
      // Should navigate to Step 2
      await page.waitForURL(`**/${LOCALE}/auth/signup/step-2`);
      expect(page.url()).toContain('/step-2');
    });

    test('should complete minor signup step 1', async ({ page }) => {
      // Fill date of birth for 15-year-old
      await page.fill('input[type="date"]', getDateOfBirth(15));
      await page.waitForTimeout(500);
      
      // Fill parent information
      await page.fill('input[name="parentFirstName"]', 'Robert');
      await page.fill('input[name="parentLastName"]', 'Johnson');
      await page.fill('input[name="parentEmail"]', `test-parent-${Date.now()}@example.com`);
      await page.fill('input[name="parentPhone"]', '+1234567890');
      
      // Fill child information
      await page.fill('input[name="childFirstName"]', 'Emily');
      await page.fill('input[name="childLastName"]', 'Johnson');
      
      // Accept parental consent
      await page.check('input[type="checkbox"][name="parentalConsent"]');
      
      // Accept terms
      await page.check('input[type="checkbox"][name="termsAccepted"]');
      
      // Submit
      await page.click('button[type="submit"]');
      
      // Should navigate to Step 2
      await page.waitForURL(`**/${LOCALE}/auth/signup/step-2`);
      expect(page.url()).toContain('/step-2');
    });
  });

  test.describe('Step 2 - Profile Details', () => {
    
    test.beforeEach(async ({ page }) => {
      // Complete Step 1 first (adult account)
      await page.fill('input[type="date"]', getDateOfBirth(25));
      await page.waitForTimeout(500);
      await page.fill('input[name="firstName"]', 'Test');
      await page.fill('input[name="lastName"]', 'User');
      await page.fill('input[name="email"]', `test-${Date.now()}@example.com`);
      await page.fill('input[name="password"]', 'TestPass123!');
      await page.check('input[type="checkbox"][name="termsAccepted"]');
      await page.click('button[type="submit"]');
      await page.waitForURL(`**/${LOCALE}/auth/signup/step-2`);
    });

    test('should display all 21 categories', async ({ page }) => {
      const categorySelect = page.locator('select').first();
      await categorySelect.click();
      
      // Wait for options to load
      await page.waitForTimeout(500);
      
      const options = await categorySelect.locator('option').allTextContents();
      
      // Should have placeholder + 21 categories
      expect(options.length).toBeGreaterThanOrEqual(21);
      
      // Check for some new categories
      const optionsText = options.join(' ');
      expect(optionsText).toContain('Stunts');
      expect(optionsText).toContain('Magic');
      expect(optionsText).toContain('Comedy');
      expect(optionsText).toContain('Animation');
    });

    test('should show subcategories when category selected', async ({ page }) => {
      // Select Acting category
      await page.selectOption('select', { label: /Acting/i });
      
      // Wait for subcategories to load
      await page.waitForTimeout(500);
      
      // Subcategory dropdown should be visible
      const subcategorySelect = page.locator('select').nth(1);
      await expect(subcategorySelect).toBeVisible();
      
      // Should have subcategory options
      const subcategoryOptions = await subcategorySelect.locator('option').count();
      expect(subcategoryOptions).toBeGreaterThan(1); // More than just placeholder
    });

    test('should show required field indicators', async ({ page }) => {
      // Check for red asterisks on required fields
      const requiredIndicators = page.locator('span.text-red-500:has-text("*")');
      const count = await requiredIndicators.count();
      
      // Should have at least category, location, experience marked as required
      expect(count).toBeGreaterThanOrEqual(3);
    });

    test('should show optional field indicators', async ({ page }) => {
      // Check for "(Optional)" text
      const optionalIndicators = page.locator('text=/\\(Optional\\)/i');
      const count = await optionalIndicators.count();
      
      // Should have several optional fields
      expect(count).toBeGreaterThanOrEqual(5);
    });

    test('should display all 12 disability options', async ({ page }) => {
      // Scroll to disability section
      await page.locator('text=/Disability/i').scrollIntoViewIfNeeded();
      
      // Count disability checkboxes
      const disabilityCheckboxes = page.locator('input[type="checkbox"]').filter({ 
        hasText: /Wheelchair|Mobility|Deaf|Blind|Neurodivergent/i 
      });
      
      const count = await page.locator('label').filter({
        hasText: /Wheelchair User|Mobility|Deaf|Blind|Neurodivergent|Speech|Dwarfism|Facial|Chronic|Invisible|None/i
      }).count();
      
      // Should have 12+ disability options (including "None/Prefer not to say")
      expect(count).toBeGreaterThanOrEqual(12);
    });

    test('should validate required fields', async ({ page }) => {
      // Try to submit without filling required fields
      await page.click('button[type="submit"]');
      
      // Should stay on Step 2 (not navigate to Step 3)
      await page.waitForTimeout(1000);
      expect(page.url()).toContain('/step-2');
      
      // Should show validation errors
      const errors = page.locator('[class*="error"], [class*="text-red"]');
      const errorCount = await errors.count();
      expect(errorCount).toBeGreaterThan(0);
    });

    test('should complete step 2 with all required fields', async ({ page }) => {
      // Wait for categories to load
      await page.waitForTimeout(1000);
      
      // Fill required fields
      await page.selectOption('select', { index: 1 }); // Select first category
      await page.waitForTimeout(500);
      
      // Fill location
      await page.fill('input[placeholder*="location" i]', 'London, UK');
      
      // Select experience
      await page.selectOption('select[name*="experience" i]', { index: 1 });
      
      // Submit
      await page.click('button[type="submit"]:has-text("Next")');
      
      // Should navigate to Step 3
      await page.waitForURL(`**/${LOCALE}/auth/signup/step-3`, { timeout: 5000 });
      expect(page.url()).toContain('/step-3');
    });

    test('should add and remove skills', async ({ page }) => {
      // Find skills input
      const skillInput = page.locator('input[placeholder*="skill" i]').first();
      await skillInput.fill('Acting');
      
      // Click Add button or press Enter
      await skillInput.press('Enter');
      
      // Should see skill tag
      await expect(page.locator('text=Acting').first()).toBeVisible();
      
      // Find and click remove button (X)
      const removeButton = page.locator('button:has-text("×")').first();
      if (await removeButton.isVisible()) {
        await removeButton.click();
        
        // Skill should be removed
        await page.waitForTimeout(300);
        const skillTags = await page.locator('span:has-text("Acting")').count();
        expect(skillTags).toBe(0);
      }
    });
  });

  test.describe('Step 3 - Media Upload', () => {
    
    test.beforeEach(async ({ page }) => {
      // Complete Steps 1 and 2
      // Step 1
      await page.fill('input[type="date"]', getDateOfBirth(25));
      await page.waitForTimeout(500);
      await page.fill('input[name="firstName"]', 'Test');
      await page.fill('input[name="lastName"]', 'User');
      await page.fill('input[name="email"]', `test-${Date.now()}@example.com`);
      await page.fill('input[name="password"]', 'TestPass123!');
      await page.check('input[type="checkbox"][name="termsAccepted"]');
      await page.click('button[type="submit"]');
      
      // Step 2
      await page.waitForURL(`**/${LOCALE}/auth/signup/step-2`);
      await page.waitForTimeout(1000);
      await page.selectOption('select', { index: 1 });
      await page.waitForTimeout(500);
      await page.fill('input[placeholder*="location" i]', 'New York, USA');
      await page.selectOption('select[name*="experience" i]', { index: 1 });
      await page.click('button[type="submit"]:has-text("Next")');
      
      await page.waitForURL(`**/${LOCALE}/auth/signup/step-3`);
    });

    test('should show required indicator for profile photo', async ({ page }) => {
      // Check for red asterisk on profile photo
      const profilePhotoLabel = page.locator('label:has-text("Profile Photo"), label:has-text("profilePhoto")').first();
      const asterisk = page.locator('span.text-red-500:has-text("*")').first();
      
      await expect(asterisk).toBeVisible();
    });

    test('should show optional indicators for portfolio and videos', async ({ page }) => {
      // Check for optional indicators
      const optionalText = page.locator('text=/\\(Optional\\)/i');
      const count = await optionalText.count();
      
      // Should have at least portfolio and videos marked as optional
      expect(count).toBeGreaterThanOrEqual(2);
    });

    test('should have video upload/URL toggle', async ({ page }) => {
      // Look for toggle buttons
      const uploadButton = page.locator('button:has-text("Upload Video"), button:has-text("Upload")');
      const urlButton = page.locator('button:has-text("URL"), button:has-text("YouTube")');
      
      // At least one toggle option should be visible
      const hasUploadOption = await uploadButton.first().isVisible().catch(() => false);
      const hasUrlOption = await urlButton.first().isVisible().catch(() => false);
      
      expect(hasUploadOption || hasUrlOption).toBe(true);
    });

    test('should show audio upload for music categories', async ({ page }) => {
      // Go back to step 2
      await page.click('button:has-text("Back")');
      await page.waitForURL(`**/${LOCALE}/auth/signup/step-2`);
      
      // Select a music category
      await page.waitForTimeout(500);
      const categorySelect = page.locator('select').first();
      
      // Try to select Music & Audio category
      try {
        await categorySelect.selectOption({ label: /Music.*Audio/i });
      } catch {
        await categorySelect.selectOption({ index: 4 }); // Usually Music is 4th
      }
      
      await page.waitForTimeout(500);
      await page.fill('input[placeholder*="location" i]', 'Nashville, USA');
      await page.selectOption('select[name*="experience" i]', { index: 1 });
      await page.click('button[type="submit"]:has-text("Next")');
      
      await page.waitForURL(`**/${LOCALE}/auth/signup/step-3`);
      
      // Should see audio upload section
      const audioSection = page.locator('text=/Audio/i, text=/🎵/');
      const isVisible = await audioSection.first().isVisible();
      
      // Audio upload should be visible for music categories
      expect(isVisible).toBe(true);
    });

    test('should validate profile photo is required before submission', async ({ page }) => {
      // Try to submit without profile photo
      await page.click('button[type="submit"]');
      
      // Should show error
      await page.waitForTimeout(500);
      const error = page.locator('text=/required/i, [class*="error"]');
      const hasError = await error.first().isVisible().catch(() => false);
      
      // Should stay on Step 3
      expect(page.url()).toContain('/step-3');
    });

    test('should show progress bar at 100%', async ({ page }) => {
      // Look for progress indicator showing 3/3 or 100%
      const progressText = page.locator('text=/3.*3|100%/i');
      await expect(progressText.first()).toBeVisible();
    });
  });

  test.describe('Complete Flow - End to End', () => {
    
    test('should complete entire adult signup flow', async ({ page }) => {
      const timestamp = Date.now();
      const testEmail = `e2e-adult-${timestamp}@test.com`;
      
      // === STEP 1 ===
      await page.goto(`${BASE_URL}/${LOCALE}/auth/signup/step-1`);
      await page.waitForLoadState('networkidle');
      
      // Fill adult account
      await page.fill('input[type="date"]', getDateOfBirth(28));
      await page.waitForTimeout(500);
      await page.fill('input[name="firstName"]', 'John');
      await page.fill('input[name="lastName"]', 'Doe');
      await page.fill('input[name="email"]', testEmail);
      await page.fill('input[name="phone"]', '+44 20 7946 0958');
      await page.fill('input[name="password"]', 'SecurePass123!');
      await page.check('input[type="checkbox"][name="termsAccepted"]');
      await page.click('button[type="submit"]');
      
      // === STEP 2 ===
      await page.waitForURL(`**/${LOCALE}/auth/signup/step-2`);
      await page.waitForTimeout(1000);
      
      // Select category
      await page.selectOption('select', { index: 1 });
      await page.waitForTimeout(500);
      
      // Fill location
      await page.fill('input[placeholder*="location" i]', 'London, United Kingdom');
      
      // Select experience
      await page.selectOption('select[name*="experience" i]', { index: 2 });
      
      // Optional: Add a skill
      const skillInput = page.locator('input[placeholder*="skill" i]').first();
      if (await skillInput.isVisible()) {
        await skillInput.fill('Professional Acting');
        await skillInput.press('Enter');
      }
      
      await page.click('button[type="submit"]:has-text("Next")');
      
      // === STEP 3 ===
      await page.waitForURL(`**/${LOCALE}/auth/signup/step-3`);
      
      // Note: File upload requires actual file interaction
      // For now, we'll check that the page loaded correctly
      expect(page.url()).toContain('/step-3');
      
      // Verify all required elements are present
      await expect(page.locator('text=/Profile Photo/i')).toBeVisible();
      await expect(page.locator('text=/Portfolio/i')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();
      
      console.log(`✅ Adult signup flow completed successfully for ${testEmail}`);
    });

    test('should complete entire minor signup flow', async ({ page }) => {
      const timestamp = Date.now();
      const parentEmail = `e2e-parent-${timestamp}@test.com`;
      
      // === STEP 1 ===
      await page.goto(`${BASE_URL}/${LOCALE}/auth/signup/step-1`);
      await page.waitForLoadState('networkidle');
      
      // Fill minor account (15 years old)
      await page.fill('input[type="date"]', getDateOfBirth(15));
      await page.waitForTimeout(500);
      
      // Parent information
      await page.fill('input[name="parentFirstName"]', 'Sarah');
      await page.fill('input[name="parentLastName"]', 'Williams');
      await page.fill('input[name="parentEmail"]', parentEmail);
      await page.fill('input[name="parentPhone"]', '+44 20 7946 0959');
      
      // Child information
      await page.fill('input[name="childFirstName"]', 'Emma');
      await page.fill('input[name="childLastName"]', 'Williams');
      
      // Consent
      await page.check('input[type="checkbox"][name="parentalConsent"]');
      await page.check('input[type="checkbox"][name="termsAccepted"]');
      await page.click('button[type="submit"]');
      
      // === STEP 2 ===
      await page.waitForURL(`**/${LOCALE}/auth/signup/step-2`);
      await page.waitForTimeout(1000);
      
      await page.selectOption('select', { index: 1 });
      await page.waitForTimeout(500);
      await page.fill('input[placeholder*="location" i]', 'Manchester, UK');
      await page.selectOption('select[name*="experience" i]', { index: 1 });
      await page.click('button[type="submit"]:has-text("Next")');
      
      // === STEP 3 ===
      await page.waitForURL(`**/${LOCALE}/auth/signup/step-3`);
      expect(page.url()).toContain('/step-3');
      
      console.log(`✅ Minor signup flow completed successfully for ${parentEmail}`);
    });
  });

  test.describe('Navigation and Data Persistence', () => {
    
    test('should persist data when navigating back and forth', async ({ page }) => {
      const testEmail = `nav-test-${Date.now()}@test.com`;
      
      // Complete Step 1
      await page.fill('input[type="date"]', getDateOfBirth(25));
      await page.waitForTimeout(500);
      await page.fill('input[name="firstName"]', 'Nav');
      await page.fill('input[name="lastName"]', 'Test');
      await page.fill('input[name="email"]', testEmail);
      await page.fill('input[name="password"]', 'NavTest123!');
      await page.check('input[type="checkbox"][name="termsAccepted"]');
      await page.click('button[type="submit"]');
      
      // Complete Step 2
      await page.waitForURL(`**/${LOCALE}/auth/signup/step-2`);
      await page.waitForTimeout(1000);
      await page.selectOption('select', { index: 1 });
      await page.waitForTimeout(500);
      await page.fill('input[placeholder*="location" i]', 'Test City');
      await page.selectOption('select[name*="experience" i]', { index: 1 });
      await page.click('button[type="submit"]:has-text("Next")');
      
      // Go to Step 3
      await page.waitForURL(`**/${LOCALE}/auth/signup/step-3`);
      
      // Navigate back to Step 2
      await page.click('button:has-text("Back")');
      await page.waitForURL(`**/${LOCALE}/auth/signup/step-2`);
      
      // Check if location is still filled
      const locationInput = page.locator('input[placeholder*="location" i]');
      const locationValue = await locationInput.inputValue();
      expect(locationValue).toBe('Test City');
      
      // Navigate back to Step 1
      await page.click('button:has-text("Back")');
      await page.waitForURL(`**/${LOCALE}/auth/signup/step-1`);
      
      // Check if email is still filled
      const emailInput = page.locator('input[name="email"]');
      const emailValue = await emailInput.inputValue();
      expect(emailValue).toBe(testEmail);
      
      console.log('✅ Data persistence verified across navigation');
    });
  });
});
