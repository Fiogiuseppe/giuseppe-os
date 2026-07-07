import { test, expect } from '@playwright/test';
import { gotoView } from './helpers';

test.describe('Giuseppe OS Memory companion chat', () => {
  test('Memory section shows launcher button for identity chat window', async ({ page }) => {
    await page.goto('/');
    await gotoView(page, 'memory');

    await expect(page.getByTestId('memory-companion-launcher')).toBeVisible();
    await expect(page.getByTestId('memory-companion-open')).toBeVisible();
    await expect(page.getByTestId('memory-constitution')).toBeVisible();
    await expect(page.getByTestId('memory-companion-input')).toHaveCount(0);
  });

  test('Chat page loads dedicated identity companion', async ({ page }) => {
    await page.goto('/chat');

    await expect(page.getByTestId('identity-companion-chat')).toBeVisible();
    await expect(page.getByTestId('memory-companion-input')).toBeVisible();
    await expect(page.getByTestId('memory-companion-status')).toBeVisible();
  });
});
