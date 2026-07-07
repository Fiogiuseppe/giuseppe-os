import { test, expect } from '@playwright/test';
import { gotoView } from './helpers';

test.describe('Giuseppe OS Memory companion chat', () => {
  test('Memory section shows identity companion input', async ({ page }) => {
    await page.goto('/');
    await gotoView(page, 'memory');

    await expect(page.getByTestId('memory-companion')).toBeVisible();
    await expect(page.getByTestId('memory-companion-input')).toBeVisible();
    await expect(page.getByTestId('memory-companion-status')).toBeVisible();
    await expect(page.getByTestId('memory-constitution')).toBeVisible();
  });
});
