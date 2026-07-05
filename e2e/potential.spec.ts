import { test, expect } from '@playwright/test';
import { gotoView, expectTodayActionVisible } from './helpers';

async function expandPotential(page: import('@playwright/test').Page) {
  await page.getByRole('button', { name: /Explore opportunities|Esplora opportunità/i }).click();
}

test.describe('Giuseppe OS potential engine', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await gotoView(page, 'brands');
    await expandPotential(page);
  });

  test('opens the Potential page', async ({ page }) => {
    await expect(page.getByText("TODAY'S OPPORTUNITY")).toBeVisible();
    await expect(page.getByText('CREATIVE CHALLENGE')).toBeVisible();
    await expect(page.getByTestId('nav-brands')).toHaveClass(/active/);
  });

  test('shows today opportunity with confidence or honest uncertainty', async ({ page }) => {
    await expect(page.locator('.potential-score').first()).toBeVisible();
    const scoreText = await page.locator('.potential-score').first().textContent();
    const trimmed = scoreText?.trim() ?? '';
    const asNumber = Number(trimmed);
    const isHonestLabel = /Learning|In apprendimento|Not enough data|Dati insufficienti/i.test(trimmed);
    expect(isHonestLabel || (asNumber >= 0 && asNumber <= 100)).toBeTruthy();
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
    await expectTodayActionVisible(page);

    await gotoView(page, 'brands');
    await expandPotential(page);
    await expect(page.getByText("TODAY'S OPPORTUNITY")).toBeVisible();
  });
});
