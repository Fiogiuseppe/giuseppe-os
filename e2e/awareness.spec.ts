import { test, expect } from '@playwright/test';

async function expandAwareness(page: import('@playwright/test').Page) {
  await page.getByRole('button', { name: 'Tell me more' }).click();
  await page.getByRole('button', { name: 'Show evidence' }).click();
}

async function expandAwarenessAction(page: import('@playwright/test').Page) {
  await page.getByRole('button', { name: 'Suggested action' }).click();
}

test.describe('Giuseppe OS awareness engine', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByRole('navigation').getByRole('button', { name: 'Discover' }).click();
  });

  test('opens the Awareness page', async ({ page }) => {
    await expect(page.getByRole('main').locator('.view-title')).toHaveText('I NOTICED SOMETHING.');
    await expect(page.getByText('INSIGHT')).toBeVisible();
    await expect(page.getByRole('navigation').getByRole('button', { name: 'Discover' })).toHaveClass(/active/);
  });

  test('shows awareness insight', async ({ page }) => {
    await expandAwareness(page);
    await expect(page.getByText('EVIDENCE FROM MEMORY')).toBeVisible();
    await expect(page.getByText('RISK IF IGNORED')).toBeVisible();
    await page.getByRole('button', { name: 'Reflect' }).click();
    await expect(page.getByText('REFLECT')).toBeVisible();
    await expect(page.getByRole('heading', { name: /Stai portando|Hai liquidità|Il lavoro sacro|Vuoi visibilità|LEGO è il motore/ })).toBeVisible();
  });

  test('shows confidence score', async ({ page }) => {
    await expandAwarenessAction(page);
    await expect(page.getByText('CONFIDENCE')).toBeVisible();
    const scoreText = await page.locator('.potential-score').textContent();
    const score = Number(scoreText?.trim());
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  test('shows recommended action', async ({ page }) => {
    await expandAwarenessAction(page);
    await expect(page.getByText('RECOMMENDED ACTION')).toBeVisible();
    await expect(page.getByText(/Scrivi|Imposta|Blocca|Prepara/)).toBeVisible();
  });

  test('navigation still works from Awareness page', async ({ page }) => {
    await page.getByRole('navigation').getByRole('button', { name: 'Decisions' }).click();
    await page.getByRole('button', { name: 'Explore purpose' }).click();
    await expect(page.getByText('PURPOSE ENGINE')).toBeVisible();

    await page.getByRole('navigation').getByRole('button', { name: 'Discover' }).click();
    await expect(page.getByRole('main').locator('.view-title')).toHaveText('I NOTICED SOMETHING.');
  });
});
