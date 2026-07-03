import { expect, type Page } from '@playwright/test';

export const TEST_PASSWORD = 'test-giuseppe-password';

export async function unlockApp(page: Page) {
  await page.goto('/');

  if (page.url().includes('/unlock')) {
    await page.getByLabel('Password').fill(TEST_PASSWORD);
    await page.getByRole('button', { name: 'Unlock' }).click();
    await expect(page.getByRole('navigation')).toBeVisible();
  }
}
