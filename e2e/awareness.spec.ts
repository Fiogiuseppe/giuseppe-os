import { test, expect } from '@playwright/test';
import { VIEW_HEADING_PATTERNS, gotoView } from './helpers';

async function expandAwareness(page: import('@playwright/test').Page) {
  await page.getByRole('button', { name: /Tell me more|Dimmi di più/i }).click();
  await page.getByRole('button', { name: /Close|Chiudi/i }).click();
  await page.getByRole('button', { name: /Show evidence|Mostra evidenza/i }).click();
}

async function expandAwarenessAction(page: import('@playwright/test').Page) {
  await page.getByRole('button', { name: /Suggested action|Azione suggerita/i }).click();
}

test.describe('Giuseppe OS insights engine', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await gotoView(page, 'insights');
    await expect(page.getByRole('main').locator('.discovery-insight .kicker')).toContainText('INSIGHT', {
      timeout: 15_000
    });
  });

  test('opens the Insights page', async ({ page }) => {
    await expect(page.locator('.insights-stage-title.view-title')).toContainText(VIEW_HEADING_PATTERNS.insights);
    await expect(page.getByRole('main').locator('.discovery-insight .kicker')).toContainText('INSIGHT');
    await expect(page.getByTestId('nav-insights')).toHaveClass(/active/);
  });

  test('shows awareness insight', async ({ page }) => {
    await expandAwareness(page);
    await expect(page.getByText('EVIDENCE FROM MEMORY')).toBeVisible();
    await expect(page.getByText('RISK IF IGNORED')).toBeVisible();
    await page.getByRole('button', { name: /Close|Chiudi/i }).click();
    await page.getByRole('button', { name: /Reflect|Rifletti/i }).click();
    await expect(page.getByText('REFLECT')).toBeVisible();
    await expect(page.locator('.reading-focus-view .discovery-panel p').first()).not.toBeEmpty();
  });

  test('shows observed patterns on demand', async ({ page }) => {
    await page.getByRole('button', { name: /Patterns|Pattern/i }).click();
    await expect(page.getByText(/PATTERN OSSERVATI|OBSERVED PATTERNS/i)).toBeVisible();
    await expect(page.getByRole('main').getByText(/entusiasta apre troppi progetti/i).first()).toBeVisible();
  });

  test('shows confidence or honest uncertainty', async ({ page }) => {
    await expandAwarenessAction(page);
    await expect(page.getByText('CONFIDENCE')).toBeVisible();
    const scoreText = await page.locator('.potential-score').textContent();
    const trimmed = scoreText?.trim() ?? '';
    const asNumber = Number(trimmed);
    const isHonestLabel = /Learning|In apprendimento|Not enough data|Dati insufficienti/i.test(trimmed);
    expect(isHonestLabel || (asNumber >= 0 && asNumber <= 100)).toBeTruthy();
  });

  test('shows recommended action', async ({ page }) => {
    await expandAwarenessAction(page);
    await expect(page.getByText('RECOMMENDED ACTION')).toBeVisible();
    await expect(page.getByText(/Scrivi|Imposta|Blocca|Prepara/)).toBeVisible();
  });

  test('navigation still works from Insights page', async ({ page }) => {
    await gotoView(page, 'decisions');
    await page.getByRole('button', { name: /Explore purpose|Esplora il proposito/i }).click();
    await expect(page.getByText('PURPOSE ENGINE')).toBeVisible();
    await page.getByRole('button', { name: /Close|Chiudi/i }).click();

    await gotoView(page, 'insights');
    await expect(page.locator('.insights-stage-title.view-title')).toContainText(VIEW_HEADING_PATTERNS.insights);
  });
});
