import { test, expect } from '@playwright/test';

const tinyPng = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+XcZcAAAAASUVORK5CYII=',
  'base64',
);

test.describe('Receipt Scan Autofill', () => {
  test('prefills title and total amount from scan suggestions', async ({ page }) => {
    await page.goto('/create');

    await page.getByRole('button', { name: 'Scan receipt' }).click();
    await page.getByTestId('receipt-file-input').setInputFiles({
      name: 'receipt.png',
      mimeType: 'image/png',
      buffer: tinyPng,
    });

    await expect(page.getByPlaceholder("Dinner at Mama's")).toHaveValue('STUB MART');
    await expect(page.getByPlaceholder('100.00')).toHaveValue('12.34');
  });

  test('allows editing and clearing prefilled values before creating a bill', async ({ page }) => {
    await page.goto('/create');

    await page.getByRole('button', { name: 'Scan receipt' }).click();
    await page.getByTestId('receipt-file-input').setInputFiles({
      name: 'receipt.png',
      mimeType: 'image/png',
      buffer: tinyPng,
    });

    await page.getByPlaceholder("Dinner at Mama's").fill('Edited Title');
    await page.getByPlaceholder('100.00').fill('99.99');

    await expect(page.getByText('Suggested from scan')).toHaveCount(0);

    await page.getByRole('button', { name: 'Clear' }).click();
    await expect(page.getByPlaceholder("Dinner at Mama's")).toHaveValue('');
    await expect(page.getByPlaceholder('100.00')).toHaveValue('');

    await page.getByPlaceholder("Dinner at Mama's").fill('Manual Bill');
    await page.getByPlaceholder('100.00').fill('150');
    await expect(page.getByPlaceholder("Dinner at Mama's")).toHaveValue('Manual Bill');
    await expect(page.getByPlaceholder('100.00')).toHaveValue('150');
  });

  test('retake replaces previous suggestions when fields are still suggested', async ({ page }) => {
    await page.goto('/create');

    await page.getByRole('button', { name: 'Scan receipt' }).click();
    await page.getByTestId('receipt-file-input').setInputFiles({
      name: 'receipt.png',
      mimeType: 'image/png',
      buffer: tinyPng,
    });

    await expect(page.getByPlaceholder("Dinner at Mama's")).toHaveValue('STUB MART');
    await expect(page.getByPlaceholder('100.00')).toHaveValue('12.34');

    await page.getByRole('button', { name: 'Retake' }).click();
    await page.getByTestId('receipt-file-input').setInputFiles({
      name: 'receipt-2.png',
      mimeType: 'image/png',
      buffer: tinyPng,
    });

    await expect(page.getByPlaceholder("Dinner at Mama's")).toHaveValue('STUB CAFE');
    await expect(page.getByPlaceholder('100.00')).toHaveValue('56.78');
  });
});
