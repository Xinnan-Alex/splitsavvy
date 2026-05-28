import { test, expect } from '@playwright/test';

test.describe('Organizer Dashboard', () => {
  test('should show bill list and details', async ({ page }) => {
    // Note: This requires the organizer to be logged in.
    
    await page.goto('/dashboard');

    // Check if at least one bill is visible (assuming seeded data)
    await expect(page.locator('h1')).toHaveText('My Bills');
    
    // Click on a bill card
    const billCard = page.locator('a[href^="/dashboard/"]').first();
    await billCard.click();

    // Check bill details page
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('text=Total to Collect')).toBeVisible();
    await expect(page.locator('text=Participants')).toBeVisible();
  });
});
