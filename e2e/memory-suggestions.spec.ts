import { test, expect } from '@playwright/test';

test.describe('Giuseppe OS memory suggestions API', () => {
  test('GET /api/memory/suggestions returns books and podcasts', async ({ request }) => {
    const response = await request.get('/api/memory/suggestions?locale=it');
    expect(response.ok()).toBeTruthy();

    const body = await response.json();
    expect(body.source).toBe('local');
    expect(Array.isArray(body.items)).toBeTruthy();
    expect(body.items.length).toBeGreaterThanOrEqual(3);

    const types = new Set(body.items.map((item: { type: string }) => item.type));
    expect(types.has('book')).toBeTruthy();
    expect(types.has('podcast')).toBeTruthy();
  });
});
