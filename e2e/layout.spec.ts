import { test, expect } from '@playwright/test';
import { gotoView, DECISION_SUBMIT_PATTERN } from './helpers';

async function expectInViewport(page: import('@playwright/test').Page, locator: import('@playwright/test').Locator) {
  await locator.scrollIntoViewIfNeeded();
  await expect(locator).toBeInViewport({ ratio: 0.2 });
}

test.describe('Giuseppe OS layout — no clipping', () => {
  test('desktop memory grid bottom content stays reachable', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');
    await gotoView(page, 'memory');

    const priorities = page.getByRole('heading', { name: 'PRIORITIES' });
    await priorities.scrollIntoViewIfNeeded();
    await expectInViewport(page, page.getByText(/Pubblicare un pensiero vero questa settimana/).first());

    const blindSpots = page.getByRole('heading', { name: 'BLIND SPOTS' });
    await expectInViewport(page, blindSpots);
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

    await page.getByPlaceholder(/comprare casa|buy a house/i).fill('investire in ETF');
    await page.getByPlaceholder(/Motivo vero|The real reason/i).fill('Voglio comprare libertà futura.');
    await page.getByRole('button', { name: DECISION_SUBMIT_PATTERN }).click();

    const betterVersion = page.locator('.result').getByRole('button', { name: /Versione migliore|Better version/i });
    await expectInViewport(page, betterVersion);
    await betterVersion.click();
    await expectInViewport(page, page.getByText(/Versione migliore|Better version/i).last());
  });

  test('mobile decisions form and submit button stay accessible', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await gotoView(page, 'decisions');

    const textarea = page.getByPlaceholder(/Motivo vero|The real reason/i);
    const submit = page.getByRole('button', { name: DECISION_SUBMIT_PATTERN });

    await expect(textarea).toBeEditable();
    await expectInViewport(page, textarea);
    await expectInViewport(page, submit);

    await textarea.fill('Voglio più chiarezza.');
    await page.getByPlaceholder(/comprare casa|buy a house/i).fill('pubblicare un post');
    await submit.click();
    await expectInViewport(page, page.locator('.result').getByText(/Categoria:/));
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

  test('desktop memory content stays reachable without page overflow', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');
    await gotoView(page, 'memory');

    for (const domain of ['MISSION', 'NORTH STAR', 'VALUES', 'PRINCIPLES', 'PROJECTS', 'PRIORITIES']) {
      await expect(page.getByRole('heading', { name: domain })).toBeVisible();
    }

    const priorities = page.getByRole('heading', { name: 'PRIORITIES' });
    await priorities.scrollIntoViewIfNeeded();
    await expectInViewport(page, priorities);

    const pageMetrics = await page.evaluate(() => ({
      bodyOverflowY: getComputedStyle(document.body).overflowY,
      docScrollHeight: document.documentElement.scrollHeight,
      docClientHeight: document.documentElement.clientHeight
    }));

    expect(pageMetrics.bodyOverflowY).toBe('hidden');
    expect(pageMetrics.docScrollHeight).toBeLessThanOrEqual(pageMetrics.docClientHeight + 1);
  });
});
