import { test, expect } from '@playwright/test';

test.describe('Giuseppe OS AI cost control', () => {
  test('ai-status reports live availability', async ({ request }) => {
    const response = await request.get('/api/ai-status');
    expect(response.ok()).toBeTruthy();

    const body = await response.json();
    expect(body).toHaveProperty('liveAvailable');
    expect(typeof body.liveAvailable).toBe('boolean');
  });

  test('todays-letter metadata reports aiMode', async ({ request }) => {
    const response = await request.get('/api/todays-letter');
    expect(response.ok()).toBeTruthy();

    const body = await response.json();
    expect(body.aiMode).toBe('mock');
  });

  test('footer AI toggle defaults to OFF', async ({ page }) => {
    await page.goto('/');
    const toggle = page.getByTestId('ai-status-toggle');
    await expect(toggle).toBeVisible();
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');
    await expect(toggle.locator('.status-dot--off')).toBeVisible();
    await expect(toggle).toContainText('AI');
  });

  test('dev regenerate control is visible on Today', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('dev-ai-controls')).toBeVisible();
    await expect(page.getByTestId('regenerate-ai-button')).toBeVisible();
  });
});
