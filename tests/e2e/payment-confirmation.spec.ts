import { test, expect } from '@playwright/test';

test.describe('Participant Payment Confirmation', () => {
  test('should allow a participant to confirm payment', async ({ page }) => {
    // Note: This requires a bill to exist. In E2E tests, you'd usually seed the DB.
    // For now, we'll assume a bill with shortId 'test-bill' exists.
    
    await page.goto('/bill/test-bill');

    // Check bill details
    await expect(page.locator('h1')).toBeVisible();
    
    const paidBadges = page.getByText('Paid', { exact: true });
    const confirmButtons = page.getByRole('button', { name: 'Confirm Payment' });

    const initialPaidCount = await paidBadges.count();
    const initialConfirmCount = await confirmButtons.count();

    // Find an unpaid participant and click confirm
    await confirmButtons.first().click();

    // Button should show loading state then disappear/show Paid
    await expect(confirmButtons).toHaveCount(Math.max(0, initialConfirmCount - 1));
    await expect(paidBadges).toHaveCount(initialPaidCount + 1);
  });
});
