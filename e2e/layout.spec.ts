import { test, expect } from '@playwright/test';
import { gotoView, DECISION_SUBMIT_PATTERN, expectTodayActionVisible, completeDecisionConversation, richDecision } from './helpers';

async function expectInViewport(page: import('@playwright/test').Page, locator: import('@playwright/test').Locator) {
  await expect(locator).toBeInViewport({ ratio: 0.2 });
}

async function expectNoPageScroll(page: import('@playwright/test').Page) {
  const pageMetrics = await page.evaluate(() => ({
    bodyOverflowY: getComputedStyle(document.body).overflowY,
    htmlOverflowY: getComputedStyle(document.documentElement).overflowY,
    docScrollHeight: document.documentElement.scrollHeight,
    docClientHeight: document.documentElement.clientHeight
  }));

  expect(pageMetrics.bodyOverflowY).toBe('hidden');
  expect(pageMetrics.htmlOverflowY).toBe('hidden');
  expect(pageMetrics.docScrollHeight).toBeLessThanOrEqual(pageMetrics.docClientHeight + 1);
}

test.describe('Giuseppe OS layout — no clipping', () => {
  test('desktop today home stays readable without page scroll', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');

    await expectTodayActionVisible(page);
    const actionText = page.getByTestId('today-action').locator('.today-action-text');
    await expect(actionText).toBeVisible({ timeout: 15_000 });
    await expectNoPageScroll(page);
  });

  test('desktop memory extra domains open via disclosure without page scroll', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');
    await gotoView(page, 'memory');

    await expect(page.getByRole('heading', { name: 'PRIORITIES' })).toBeVisible();
    await page.getByRole('button', { name: /Esplora memoria completa|Explore full memory/i }).click();

    const blindSpots = page.getByRole('heading', { name: 'BLIND SPOTS' });
    await expectInViewport(page, blindSpots);
    await expectNoPageScroll(page);
  });

  test('desktop memory grid shows rules without interaction', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');
    await gotoView(page, 'memory');

    const rulesItem = page.getByRole('heading', { name: 'PRINCIPLES' });
    await expectInViewport(page, rulesItem);
  });

  test('desktop decisions expanded result remains reachable in content area', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');
    await gotoView(page, 'decisions');

    await completeDecisionConversation(
      page,
      richDecision('investire in ETF', 'Voglio comprare libertà futura.'),
      'Voglio comprare libertà futura.'
    );

    const betterVersion = page.locator('.result').getByRole('button', { name: /Versione migliore|Better version/i });
    await expect(betterVersion).toBeVisible({ timeout: 25_000 });
    await betterVersion.click();
    await expect(page.locator('.result').getByRole('heading', { name: /Versione migliore|Better version/i })).toBeVisible();
    await expectNoPageScroll(page);
  });

  test('mobile decisions conversation stays accessible', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await gotoView(page, 'decisions');

    const opening = page.getByTestId('decision-open-input');
    const submit = page.getByTestId('decision-continue');

    await expect(opening).toBeEditable();
    await expectInViewport(page, opening);
    await expectInViewport(page, submit);

    await opening.fill('pubblicare un post su LinkedIn. Voglio mostrare come penso.');
    await submit.click();
    await expect(page.locator('.result').getByText(/Categoria:|Category:/)).toBeVisible({ timeout: 25_000 });
    await expectNoPageScroll(page);
  });

  test('mobile top navigation uses a single compact row', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    const topbar = page.locator('.topbar');
    const box = await topbar.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.height).toBeLessThanOrEqual(48);

    await expect(page.getByTestId('nav-today')).toBeVisible();
    await expect(page.getByTestId('nav-memory')).toBeVisible();
  });

  test('desktop memory primary content stays visible without page overflow', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');
    await gotoView(page, 'memory');

    for (const domain of ['MISSION', 'NORTH STAR', 'VALUES', 'PRINCIPLES', 'PROJECTS', 'PRIORITIES']) {
      await expect(page.getByRole('heading', { name: domain })).toBeVisible();
    }

    await expectNoPageScroll(page);
  });
});
