import { test, expect } from '@playwright/test';

test.describe('Bill Creation', () => {
  test('should allow an organizer to create a bill', async ({ page }) => {
    // Note: This assumes the organizer is already logged in or auth is bypassed for testing
    // In a real scenario, you'd handle login here.
    
    await page.goto('/create');

    // Fill in bill details
    await page.fill('input[placeholder="Dinner at Mama\'s"]', 'Team Lunch');
    await page.fill('input[type="number"]', '150');
    await page.fill('input[type="date"]', '2026-06-30');

    // Fill in participant details
    await page.fill('input[placeholder="John Doe"]', 'Alice');
    await page.locator('input[placeholder="25.00"]').first().fill('75');

    // Add another participant
    await page.click('text=Add');
    await page.fill('div:nth-child(2) > div:nth-child(1) > input', 'Bob');
    await page.fill('div:nth-child(2) > div:nth-child(2) > input', '75');

    // Submit form
    await page.click('button:has-text("Create Bill")');

    // Should redirect to success page
    await expect(page).toHaveURL(/\/create\/success\//);
    await expect(page.locator('h1')).toHaveText('Bill Created!');
    
    // Check if share link exists
    const shareLink = page.locator('div.font-mono');
    await expect(shareLink).toContainText('/bill/');
  });
});
