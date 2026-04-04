
import { test, expect } from '@playwright/test';

test.describe('Admin Growth Features', () => {
  // Use existing admin session or login
  test.use({ storageState: 'playwright/.auth/admin.json' });

  test('should navigate to Growth page and show tabs', async ({ page }) => {
    await page.goto('/admin/growth');
    await expect(page.getByRole('heading', { name: 'Growth & Marketing' })).toBeVisible();
    
    // Check tabs exist
    await expect(page.getByText('Analytics')).toBeVisible();
    await expect(page.getByText('Ad Manager')).toBeVisible();
    await expect(page.getByText('Featured Items')).toBeVisible();
  });

  test('should allow creating a new ad', async ({ page }) => {
    await page.goto('/admin/growth');
    
    // Switch to Ad Manager tab
    await page.click('button:has-text("Ad Manager")');
    
    // Open Create Modal
    await page.click('button:has-text("Create Ad")');
    await expect(page.getByText('New Ad')).toBeVisible();
    
    // Fill Form
    const uniqueTitle = `Test Ad ${Date.now()}`;
    await page.fill('input[placeholder="Title"]', uniqueTitle);
    await page.fill('input[placeholder="Image URL"]', 'https://via.placeholder.com/300');
    
    // Save
    await page.click('button:has-text("Save")');
    
    // Verify it appears in the list
    await expect(page.getByText(uniqueTitle)).toBeVisible();
    
    // Cleanup: Delete the created ad
    // Finding the card that contains the text and clicking delete
    // This is a bit tricky without specific test IDs, but assuming the layout:
    const adCard = page.locator('div.border.rounded-lg', { hasText: uniqueTitle });
    await adCard.getByRole('button', { name: 'Delete' }).click();
    
    // Confirm deletion if there's a confirm dialog (our code uses window.confirm)
    page.on('dialog', dialog => dialog.accept());
    
    // Verify it's gone
    await expect(page.getByText(uniqueTitle)).not.toBeVisible();
  });

  test('should load analytics data', async ({ page }) => {
    await page.goto('/admin/growth');
    // Analytics is default tab
    
    // Wait for loading to finish
    await expect(page.getByText('Loading analytics...')).not.toBeVisible();
    
    // Check for stats cards
    await expect(page.getByText('Total Users')).toBeVisible();
    await expect(page.getByText('User Growth')).toBeVisible();
    
    // Check if charts are rendered (recharts usually renders SVGs)
    await expect(page.locator('.recharts-surface').first()).toBeVisible();
  });
});
