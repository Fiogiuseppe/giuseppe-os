import { test, expect } from '@playwright/test';

const NAV_VIEWS = [
  { label: 'Board', heading: /PROGETTARE UNA VITA CHE MI RENDA LIBERO DI CREARE CIÒ CHE CONTA/ },
  { label: 'Today', heading: /UN PASSO ALLA VOLTA VERSO LA LIBERTÀ/ },
  { label: 'Projects', heading: /IL SISTEMA GIUSEPPE/ },
  { label: 'Finance', heading: /COMPRA LIBERTÀ, NON STATUS/ },
  { label: 'Brain', heading: /CHI HO SCELTO DI DIVENTARE/ }
] as const;

test.describe('Giuseppe OS navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('loads the home page', async ({ page }) => {
    await expect(page.getByText('GIUSEPPE OS')).toBeVisible();
    await expect(page.getByText('v0.1 foundation · next step: real AI + persistent memory')).toBeVisible();
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
      await nav.getByRole('button', { name: label }).click();
      await expect(page.getByRole('main').getByText(heading)).toBeVisible();
      await expect(nav.getByRole('button', { name: label })).toHaveClass(/active/);
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
