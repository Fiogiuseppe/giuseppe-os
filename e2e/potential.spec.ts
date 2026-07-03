import { test, expect } from '@playwright/test';
import { unlockApp } from './helpers/auth';

test.describe('Giuseppe OS potential engine', () => {
  test.beforeEach(async ({ page }) => {
    await unlockApp(page);
    await page.getByRole('navigation').getByRole('button', { name: 'Potential' }).click();
  });

  test('opens the Potential page', async ({ page }) => {
    await expect(page.getByText("TODAY'S OPPORTUNITY")).toBeVisible();
    await expect(page.getByText('OPPORTUNITY HISTORY')).toBeVisible();
    await expect(page.getByRole('navigation').getByRole('button', { name: 'Potential' })).toHaveClass(/active/);
  });

  test('shows today opportunity with confidence score', async ({ page }) => {
    await expect(page.locator('.potential-score')).toBeVisible();
    const scoreText = await page.locator('.potential-score').textContent();
    const score = Number(scoreText?.trim());
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
    await expect(page.getByText(/Prima azione:/)).toBeVisible();
    await expect(page.getByText(/Perché conta:/)).toBeVisible();
  });

  test('shows potential intelligence sections', async ({ page }) => {
    const sections = [
      'CREATIVE CHALLENGE',
      'SKILL TO LEARN',
      'PERSON TO CONTACT',
      'ARTICLE TO READ',
      'PROJECT TO FINISH',
      'RISK TO AVOID',
      'QUESTION OF THE DAY',
      'WEEKLY FOCUS'
    ];

    for (const section of sections) {
      await expect(page.getByText(section)).toBeVisible();
    }
  });

  test('navigation still works from Potential page', async ({ page }) => {
    await page.getByRole('navigation').getByRole('button', { name: 'Board' }).click();
    await expect(page.getByText('PURPOSE ENGINE')).toBeVisible();

    await page.getByRole('navigation').getByRole('button', { name: 'Potential' }).click();
    await expect(page.getByText("TODAY'S OPPORTUNITY")).toBeVisible();
  });
});
