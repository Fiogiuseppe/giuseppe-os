import { test, expect } from '@playwright/test';
import { expectTodayActionVisible } from './helpers';

test.describe('Giuseppe OS PWA', () => {
  test('manifest is served with standalone display', async ({ request }) => {
    const response = await request.get('/manifest.webmanifest');
    expect(response.ok()).toBeTruthy();

    const manifest = await response.json();
    expect(manifest.name).toBe('Giuseppe OS');
    expect(manifest.display).toBe('standalone');
    expect(manifest.start_url).toBe('/');
    expect(manifest.icons?.length).toBeGreaterThanOrEqual(2);
  });

  test('apple touch icon and PWA icons are reachable', async ({ request }) => {
    for (const path of [
      '/icons/apple-touch-icon.png',
      '/icons/icon-192.png',
      '/icons/icon-512.png'
    ]) {
      const response = await request.get(path);
      expect(response.ok(), path).toBeTruthy();
      expect(response.headers()['content-type']).toMatch(/image\/png/);
    }
  });

  test('mobile Today shows one AI move with optional action button', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    await expect(page.getByTestId('today-ritual')).toBeVisible();
    await expect(page.getByTestId('today-action')).toBeHidden();

    await expectTodayActionVisible(page);
  });
});
