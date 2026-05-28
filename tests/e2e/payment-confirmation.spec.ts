import { test, expect } from '@playwright/test';

test.describe('Participant Payment Confirmation', () => {
  test('should allow a participant to confirm payment', async ({ page }) => {
    // Note: This requires a bill to exist. In E2E tests, you'd usually seed the DB.
    // For now, we'll assume a bill with shortId 'test-bill' exists.
    
    await page.goto('/bill/test-bill');

    // Check bill details
    await expect(page.locator('h1')).toBeVisible();
    
    // Find an unpaid participant and click confirm
    const confirmButton = page.locator('button:has-text("Confirm Payment")').first();
    await confirmButton.click();

    // Button should show loading state then disappear/show Paid
    await expect(page.locator('text=Paid').first()).toBeVisible();
    await expect(confirmButton).not.toBeVisible();
  });
});
