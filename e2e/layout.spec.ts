import { test, expect } from '@playwright/test';

async function expectInViewport(page: import('@playwright/test').Page, locator: import('@playwright/test').Locator) {
  await locator.scrollIntoViewIfNeeded();
  await expect(locator).toBeInViewport({ ratio: 0.2 });
}

test.describe('Giuseppe OS layout — no clipping', () => {
  test('desktop memory grid bottom content stays reachable', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');
    await page.getByRole('navigation').getByRole('button', { name: 'Memory' }).click();

    const priorities = page.getByRole('heading', { name: 'PRIORITIES' });
    await priorities.scrollIntoViewIfNeeded();
    await expectInViewport(page, page.getByText(/Pubblicare un pensiero vero questa settimana/));

    const patterns = page.getByRole('heading', { name: 'PATTERNS' });
    await expectInViewport(page, patterns);
  });

  test('desktop memory grid shows rules without interaction', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');
    await page.getByRole('navigation').getByRole('button', { name: 'Memory' }).click();

    const rulesItem = page.getByRole('main').getByText('Compra tempo, non status.');
    await expectInViewport(page, rulesItem);
  });

  test('desktop decisions expanded result remains reachable in content area', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');
    await page.getByRole('navigation').getByRole('button', { name: 'Decisions' }).click();

    await page.getByPlaceholder('Es. comprare casa, pubblicare un post, investire...').fill('investire in ETF');
    await page.getByPlaceholder('Motivo vero.').fill('Voglio comprare libertà futura.');
    await page.getByRole('button', { name: 'Chiedi al Board' }).click();

    const betterVersion = page.locator('.result').getByRole('button', { name: 'Versione migliore' });
    await expectInViewport(page, betterVersion);
    await betterVersion.click();
    await expectInViewport(page, page.getByText('Versione migliore').last());
  });

  test('mobile decisions form and submit button stay accessible', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await page.getByRole('navigation').getByRole('button', { name: 'Decisions' }).click();

    const textarea = page.getByPlaceholder('Motivo vero.');
    const submit = page.getByRole('button', { name: 'Chiedi al Board' });

    await expect(textarea).toBeEditable();
    await expectInViewport(page, textarea);
    await expectInViewport(page, submit);

    await textarea.fill('Voglio più chiarezza.');
    await page.getByPlaceholder('Es. comprare casa, pubblicare un post, investire...').fill('pubblicare un post');
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

    await expect(page.getByRole('navigation').getByRole('button', { name: 'Today' })).toBeVisible();
    await expect(page.getByRole('navigation').getByRole('button', { name: 'Memory' })).toBeVisible();
  });

  test('desktop content scrolls internally without page overflow', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');
    await page.getByRole('navigation').getByRole('button', { name: 'Memory' }).click();

    for (const domain of ['IDENTITY', 'MISSION', 'NORTH STAR', 'VALUES', 'RULES', 'PROJECTS', 'RELATIONSHIPS']) {
      await expect(page.getByRole('heading', { name: domain })).toBeVisible();
    }

    const viewBody = page.locator('.view-body');
    const canScroll = await viewBody.evaluate(el => el.scrollHeight > el.clientHeight);
    expect(canScroll).toBe(true);

    const pageMetrics = await page.evaluate(() => ({
      bodyOverflowY: getComputedStyle(document.body).overflowY,
      docScrollHeight: document.documentElement.scrollHeight,
      docClientHeight: document.documentElement.clientHeight
    }));

    expect(pageMetrics.bodyOverflowY).toBe('hidden');
    expect(pageMetrics.docScrollHeight).toBeLessThanOrEqual(pageMetrics.docClientHeight + 1);
  });
});
