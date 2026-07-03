import { test, expect } from '@playwright/test';

const NAV_VIEWS = [
  { label: 'Home', heading: /GIUSEPPE OS/ },
  { label: 'Board', heading: /PROGETTARE UNA VITA CHE MI RENDA LIBERO DI CREARE CIÒ CHE CONTA/ },
  { label: 'Today', heading: /UN PASSO ALLA VOLTA VERSO LA LIBERTÀ/ },
  { label: 'Projects', heading: /IL SISTEMA GIUSEPPE/ },
  { label: 'Finance', heading: /COMPRA LIBERTÀ, NON STATUS/ },
  { label: 'Awareness', heading: /I NOTICED SOMETHING/ },
  { label: 'Brain', heading: /CHI HO SCELTO DI DIVENTARE/ }
] as const;

test.describe('Giuseppe OS navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('loads the home page', async ({ page }) => {
    await expect(page.getByText('GIUSEPPE OS').first()).toBeVisible();
    await expect(page.getByText("It's not software that tells you what to do.")).toBeVisible();
    await expect(page.getByText("It's software that remembers who you chose to become.")).toBeVisible();
  });

  test('shows all navigation buttons', async ({ page }) => {
    const nav = page.getByRole('navigation');

    for (const { label } of NAV_VIEWS) {
      await expect(nav.getByRole('button', { name: label })).toBeVisible();
    }
  });

  test('switches visible content when navigation buttons are clicked', async ({ page }) => {
    const nav = page.getByRole('navigation');

    for (const { label, heading } of NAV_VIEWS) {
      await nav.getByRole('button', { name: label, exact: true }).click();
      await expect(page.getByRole('main').locator('.view-title')).toContainText(heading);
      await expect(nav.getByRole('button', { name: label, exact: true })).toHaveClass(/active/);
    }
  });

  test('accepts text in the decision form on Today view', async ({ page }) => {
    await page.getByRole('navigation').getByRole('button', { name: 'Today' }).click();

    const decisionInput = page.getByPlaceholder('Es. comprare casa, pubblicare un post, investire...');
    const reasonInput = page.getByPlaceholder('Motivo vero.');

    await decisionInput.fill('comprare casa a Copenaghen');
    await reasonInput.fill('Voglio più stabilità per la famiglia.');

    await expect(decisionInput).toHaveValue('comprare casa a Copenaghen');
    await expect(reasonInput).toHaveValue('Voglio più stabilità per la famiglia.');
    await expect(page.getByRole('button', { name: 'Chiedi al Board' })).toBeEnabled();
  });
});

test.describe('Giuseppe OS decision board', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByRole('navigation').getByRole('button', { name: 'Today' }).click();
  });

  async function askBoard(page: import('@playwright/test').Page, decision: string, reason: string) {
    await page.getByPlaceholder('Es. comprare casa, pubblicare un post, investire...').fill(decision);
    await page.getByPlaceholder('Motivo vero.').fill(reason);
    await page.getByRole('button', { name: 'Chiedi al Board' }).click();
    await expect(page.locator('.result')).toBeVisible();
  }

  test('submits the decision form and shows board output', async ({ page }) => {
    await askBoard(page, 'comprare casa a Copenaghen', 'Voglio più stabilità per la famiglia.');

    await expect(page.getByText('Categoria: Immobiliare')).toBeVisible();
    await expect(page.getByText('Bisogno nascosto:')).toBeVisible();
    await expect(page.getByText('Versione migliore')).toBeVisible();
    await expect(page.getByText('Prossimo passo')).toBeVisible();
  });

  test('different decisions produce different categories', async ({ page }) => {
    await askBoard(page, 'comprare casa a Copenaghen', 'Voglio più stabilità per la famiglia.');
    await expect(page.getByText('Categoria: Immobiliare')).toBeVisible();

    await askBoard(page, 'pubblicare un post su LinkedIn', 'Voglio mostrare come penso.');
    await expect(page.getByText('Categoria: Reputazione')).toBeVisible();
    await expect(page.getByText('Categoria: Immobiliare')).not.toBeVisible();
  });

  test('board output contains at least four counsellors', async ({ page }) => {
    await askBoard(page, 'investire in ETF', 'Voglio comprare libertà futura.');

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
