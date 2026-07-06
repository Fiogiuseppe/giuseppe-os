import { test, expect } from '@playwright/test';

const SOURCE_COUNT = 6;
const SOURCE_IDS = [
  'instagram',
  'linkedin',
  'medium',
  'website',
  'urees-instagram',
  'urees-website'
] as const;

test.describe('Giuseppe OS Sources — Phase 1 dashboard', () => {
  test('GET /api/sources returns six safe mock sources only', async ({ request }) => {
    const response = await request.get('/api/sources');
    expect(response.ok()).toBeTruthy();

    const body = await response.json();
    expect(body.sources.length).toBe(SOURCE_COUNT);

    for (const id of SOURCE_IDS) {
      expect(body.sources.some((row: { id: string }) => row.id === id)).toBeTruthy();
    }

    expect(body.sources.some((row: { id: string }) => row.id === 'github')).toBeFalsy();
    expect(body.sources.some((row: { id: string }) => row.id === 'gmail')).toBeFalsy();

    const instagram = body.sources.find((row: { id: string }) => row.id === 'instagram');
    expect(instagram.group).toBe('personal');
    expect(instagram.authMethod).toBe('mock');
    expect(instagram).not.toHaveProperty('accessToken');
    expect(instagram).not.toHaveProperty('refreshToken');
    expect(instagram).not.toHaveProperty('clientSecret');
  });

  test('Sources page loads with Personal and UREES groups only', async ({ page }) => {
    await page.goto('/sources');
    await expect(page.getByTestId('sources-dashboard')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Sources' })).toBeVisible();
    await expect(page.getByTestId('source-group-personal')).toBeVisible();
    await expect(page.getByTestId('source-group-urees')).toBeVisible();
    await expect(page.getByTestId('source-group-personal')).toContainText('Personal');
    await expect(page.getByTestId('source-group-urees')).toContainText('UREES');

    for (const id of SOURCE_IDS) {
      await expect(page.getByTestId(`source-card-${id}`)).toBeVisible();
    }

    await expect(page.getByTestId('source-card-github')).toHaveCount(0);
  });

  test('Source actions are not available in Phase 1', async ({ request }) => {
    const connect = await request.post('/api/sources', {
      data: { sourceId: 'medium', action: 'connect' }
    });
    expect(connect.status()).toBe(501);
  });
});
