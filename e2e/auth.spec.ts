import { test, expect } from '@playwright/test';
import { TEST_PASSWORD, unlockApp } from './helpers/auth';

test.describe('Giuseppe OS private access', () => {
  test('unauthenticated users cannot see the app', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveURL(/\/unlock/);
    await expect(page.getByText('PRIVATE ACCESS')).toBeVisible();
    await expect(page.getByRole('navigation')).not.toBeVisible();
    await expect(page.getByText('PURPOSE ENGINE')).not.toBeVisible();
  });

  test('invalid password keeps the app locked', async ({ page }) => {
    await page.goto('/unlock');

    await page.getByLabel('Password').fill('wrong-password');
    await page.getByRole('button', { name: 'Unlock' }).click();

    await expect(page.getByText('Password non valida.')).toBeVisible();
    await expect(page).toHaveURL(/\/unlock/);
    await expect(page.getByRole('navigation')).not.toBeVisible();
  });

  test('authenticated users can access the app', async ({ page }) => {
    await unlockApp(page);

    await expect(page.getByText('GIUSEPPE OS')).toBeVisible();
    await expect(page.getByText('PURPOSE ENGINE')).toBeVisible();
    await expect(page.getByText("It's not software that tells you what to do.")).toBeVisible();
  });

  test('navigation works after unlock', async ({ page }) => {
    await unlockApp(page);

    const nav = page.getByRole('navigation');
    await nav.getByRole('button', { name: 'Awareness' }).click();
    await expect(page.getByText('I NOTICED SOMETHING.')).toBeVisible();

    await nav.getByRole('button', { name: 'Today' }).click();
    await expect(page.getByText('UN PASSO ALLA VOLTA VERSO LA LIBERTÀ.')).toBeVisible();

    await nav.getByRole('button', { name: 'Board' }).click();
    await expect(page.getByText('PURPOSE ENGINE')).toBeVisible();
  });

  test('unlock page does not expose the password in the client bundle', async ({ page }) => {
    await page.goto('/unlock');
    const html = await page.content();
    expect(html).not.toContain(TEST_PASSWORD);
  });
});
