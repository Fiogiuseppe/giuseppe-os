import { test, expect } from '@playwright/test';

test.describe('Giuseppe OS AI cost control', () => {
  test('ai-status reports server mode', async ({ request }) => {
    const response = await request.get('/api/ai-status');
    expect(response.ok()).toBeTruthy();

    const body = await response.json();
    expect(body.mode).toBe('mock');
  });

  test('todays-letter metadata reports aiMode', async ({ request }) => {
    const response = await request.get('/api/todays-letter');
    expect(response.ok()).toBeTruthy();

    const body = await response.json();
    expect(body.aiMode).toBe('mock');
  });

  test('footer AI indicator is read-only and OFF', async ({ page }) => {
    await page.goto('/');
    const indicator = page.getByTestId('ai-status-indicator');
    await expect(indicator).toBeVisible();
    await expect(indicator.locator('.status-dot--off')).toBeVisible();
    await expect(indicator).toContainText('AI');
    await expect(indicator).not.toHaveRole('button');
  });

  test('dev regenerate control is visible on Today', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('dev-ai-controls')).toBeVisible();
    await expect(page.getByTestId('regenerate-ai-button')).toBeVisible();
  });
});
