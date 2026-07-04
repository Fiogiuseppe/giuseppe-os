import { test, expect } from '@playwright/test';
import { gotoView } from './helpers';

async function expandPotential(page: import('@playwright/test').Page) {
  await page.getByRole('button', { name: /Explore opportunities|Esplora opportunità/i }).click();
}

test.describe('Giuseppe OS potential engine', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await gotoView(page, 'create');
    await expandPotential(page);
  });

  test('opens the Potential page', async ({ page }) => {
    await expect(page.getByText("TODAY'S OPPORTUNITY")).toBeVisible();
    await expect(page.getByText('OPPORTUNITY HISTORY')).toBeVisible();
    await expect(page.getByTestId('nav-create')).toHaveClass(/active/);
  });

  test('shows today opportunity with confidence score', async ({ page }) => {
    await expect(page.locator('.potential-score').first()).toBeVisible();
    const scoreText = await page.locator('.potential-score').first().textContent();
    const score = Number(scoreText?.trim());
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
    await expect(page.getByText(/Prima azione:|First action:/)).toBeVisible();
    await expect(page.getByText(/Perché conta:|Why it matters:/)).toBeVisible();
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
    await gotoView(page, 'today');
    await expect(page.locator('.companion-greeting')).toContainText(
      /Good (morning|afternoon|evening|night),?\s*Giuseppe/i,
      { timeout: 15_000 }
    );

    await gotoView(page, 'create');
    await expandPotential(page);
    await expect(page.getByText("TODAY'S OPPORTUNITY")).toBeVisible();
  });
});
