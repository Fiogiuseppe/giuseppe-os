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

  test('dev regenerate control stays hidden when AI is mock', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('dev-ai-controls')).toBeHidden();
  });
});
