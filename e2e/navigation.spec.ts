import { test, expect } from '@playwright/test';
import { FOOTER_PATTERN, VIEW_HEADING_PATTERNS, gotoView, DECISION_SUBMIT_PATTERN, expectTodayActionVisible } from './helpers';

const NAV_VIEWS = [
  { id: 'today' as const },
  { id: 'decisions' as const, heading: VIEW_HEADING_PATTERNS.decisions },
  { id: 'insights' as const, heading: VIEW_HEADING_PATTERNS.insights },
  { id: 'create' as const, heading: VIEW_HEADING_PATTERNS.create },
  { id: 'memory' as const, heading: VIEW_HEADING_PATTERNS.memory }
] as const;

async function expectNoPageScroll(page: import('@playwright/test').Page) {
  const metrics = await page.evaluate(() => ({
    docScrollHeight: document.documentElement.scrollHeight,
    docClientHeight: document.documentElement.clientHeight,
    bodyScrollHeight: document.body.scrollHeight,
    bodyClientHeight: document.body.clientHeight,
    bodyOverflowY: getComputedStyle(document.body).overflowY,
    htmlOverflowY: getComputedStyle(document.documentElement).overflowY
  }));

  expect(metrics.bodyOverflowY).toBe('hidden');
  expect(metrics.htmlOverflowY).toBe('hidden');
  expect(metrics.docScrollHeight).toBeLessThanOrEqual(metrics.docClientHeight + 1);
  expect(metrics.bodyScrollHeight).toBeLessThanOrEqual(metrics.bodyClientHeight + 1);
}

test.describe('Giuseppe OS navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('loads the home page', async ({ page }) => {
    await expectTodayActionVisible(page);
    await expect(page.getByRole('button', { name: 'Giuseppe OS home' })).toBeVisible();
    await expect(page.locator('footer.footer')).toContainText(FOOTER_PATTERN);
  });

  test('shows all navigation buttons', async ({ page }) => {
    const nav = page.getByRole('navigation');

    for (const { id } of NAV_VIEWS) {
      await expect(nav.getByTestId(`nav-${id}`)).toBeVisible();
    }
  });

  test('switches visible content when navigation buttons are clicked', async ({ page }) => {
    const nav = page.getByRole('navigation');

    for (const view of NAV_VIEWS) {
      await nav.getByTestId(`nav-${view.id}`).click();
      if (view.id === 'today') {
        await expectTodayActionVisible(page);
      } else {
        await expect(page.getByRole('main').locator('.view-title')).toContainText(view.heading);
      }
      await expect(nav.getByTestId(`nav-${view.id}`)).toHaveClass(/active/);
    }
  });

  test('accepts text in the decision form on Decisions view', async ({ page }) => {
    await gotoView(page, 'decisions');

    const decisionInput = page.getByPlaceholder(/comprare casa|buy a house/i);
    const reasonInput = page.getByPlaceholder(/Motivo vero|The real reason/i);

    await decisionInput.fill('comprare casa a Copenaghen');
    await reasonInput.fill('Voglio più stabilità per la famiglia.');

    await expect(decisionInput).toHaveValue('comprare casa a Copenaghen');
    await expect(reasonInput).toHaveValue('Voglio più stabilità per la famiglia.');
    await expect(page.getByRole('button', { name: DECISION_SUBMIT_PATTERN })).toBeEnabled();
  });

  test('desktop viewport has no page scroll on any main section', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');

    const nav = page.getByRole('navigation');

    for (const { id } of NAV_VIEWS) {
      await nav.getByTestId(`nav-${id}`).click();
      await expect(page.getByRole('main')).toBeVisible();
      await expectNoPageScroll(page);
    }
  });
});

test.describe('Giuseppe OS decision board', () => {
  test.setTimeout(60_000);

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await gotoView(page, 'decisions');
  });

  async function askBoard(page: import('@playwright/test').Page, decision: string, reason: string) {
    await page.getByPlaceholder(/comprare casa|buy a house/i).fill(decision);
    await page.getByPlaceholder(/Motivo vero|The real reason/i).fill(reason);
    await page.getByRole('button', { name: DECISION_SUBMIT_PATTERN }).click();
    await expect(page.locator('.result')).toBeVisible({ timeout: 25_000 });
    await page.locator('.result').getByRole('button', { name: /Mostra il Board|Show the Board/i }).click();
    await page.locator('.result').getByRole('button', { name: /Versione migliore|Better version/i }).click();
    await page.locator('.result').getByRole('button', { name: /Close|Chiudi/i }).click();
  }

  test('submits the decision form and shows board output', async ({ page }) => {
    await askBoard(page, 'comprare casa a Copenaghen', 'Voglio più stabilità per la famiglia.');

    await expect(page.getByText('Categoria: Immobiliare')).toBeVisible();
    await expect(page.getByText('Prossimo passo')).toBeVisible();
    await page.locator('.result').getByRole('button', { name: /Perché|Why/i }).click();
    await expect(page.getByText('Bisogno nascosto:')).toBeVisible();
    await page.locator('.result').getByRole('button', { name: /Versione migliore|Better version/i }).click();
    await expect(page.getByText('Versione migliore')).toBeVisible();
  });

  test('different decisions produce different categories', async ({ page }) => {
    await askBoard(page, 'comprare casa a Copenaghen', 'Voglio più stabilità per la famiglia.');
    await expect(page.getByText('Categoria: Immobiliare')).toBeVisible();

    await page.reload();
    await gotoView(page, 'decisions');
    await askBoard(page, 'pubblicare un post su LinkedIn', 'Voglio mostrare come penso.');
    await expect(page.getByText('Categoria: Reputazione')).toBeVisible();
    await expect(page.getByText('Categoria: Immobiliare')).not.toBeVisible();
  });

  test('board output contains at least four counsellors', async ({ page }) => {
    await page.getByPlaceholder(/comprare casa|buy a house/i).fill('investire in ETF');
    await page.getByPlaceholder(/Motivo vero|The real reason/i).fill('Voglio comprare libertà futura.');
    await page.getByRole('button', { name: DECISION_SUBMIT_PATTERN }).click();
    await expect(page.locator('.result')).toBeVisible({ timeout: 25_000 });
    await page.locator('.result').getByRole('button', { name: /Mostra il Board|Show the Board/i }).click();

    const counsellors = ['CEO 2036', 'CFO', 'Strategist', 'Creative Director', 'Psychologist', 'Mentor'];
    let visibleCount = 0;

    for (const name of counsellors) {
      if (await page.getByText(new RegExp(`${name}:`)).isVisible()) {
        visibleCount += 1;
      }
    }

    expect(visibleCount).toBeGreaterThanOrEqual(4);
  });
});
