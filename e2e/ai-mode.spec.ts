import { test, expect } from '@playwright/test';

test.describe('Giuseppe OS AI cost control', () => {
  test('ai-status exposes mock mode in development', async ({ request }) => {
    const response = await request.get('/api/ai-status');
    expect(response.ok()).toBeTruthy();

    const body = await response.json();
    expect(body.showIndicator).toBe(true);
    expect(body.mode).toBe('mock');
  });

  test('todays-letter metadata reports aiMode', async ({ request }) => {
    const response = await request.get('/api/todays-letter');
    expect(response.ok()).toBeTruthy();

    const body = await response.json();
    expect(body.aiMode).toBe('mock');
  });

  test('dev regenerate control is visible on Today', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('dev-ai-controls')).toBeVisible();
    await expect(page.getByTestId('ai-mode-indicator')).toContainText('AI: MOCK');
    await expect(page.getByTestId('regenerate-ai-button')).toBeVisible();
  });
});
