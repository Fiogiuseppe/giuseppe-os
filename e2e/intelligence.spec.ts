import { test, expect } from '@playwright/test';

async function resetStores(request: import('@playwright/test').APIRequestContext) {
  const response = await request.post('/api/test/reset-stores');
  expect(response.ok()).toBeTruthy();
}

async function seedWebsiteKnowledge(request: import('@playwright/test').APIRequestContext) {
  await request.post('/api/sources', {
    data: { sourceId: 'website', action: 'connect' }
  });
  await request.post('/api/sources', {
    data: { sourceId: 'website', action: 'sync' }
  });
}

test.describe.configure({ mode: 'serial' });

test.describe('Giuseppe OS Intelligence Read — Phase 5', () => {
  test.beforeAll(async ({ request }) => {
    await resetStores(request);
    await seedWebsiteKnowledge(request);
  });

  test('query all knowledge for Giuseppe', async ({ request }) => {
    const response = await request.get('/api/intelligence/knowledge?owner=giuseppe');
    expect(response.ok()).toBeTruthy();
    const body = await response.json();

    expect(body.count).toBeGreaterThan(0);
    expect(body.items.length).toBe(body.count);
    expect(body.query.owner).toBe('giuseppe');

    for (const item of body.items) {
      expect(item.owner).toBe('giuseppe');
      expect(item.evidenceUrls.length).toBeGreaterThan(0);
    }
  });

  test('query only projects', async ({ request }) => {
    const response = await request.get('/api/intelligence/knowledge?knowledgeType=project');
    expect(response.ok()).toBeTruthy();
    const body = await response.json();

    expect(body.count).toBeGreaterThan(0);
    for (const item of body.items) {
      expect(item.knowledgeType).toBe('project');
      expect(item.evidenceUrls.length).toBeGreaterThan(0);
    }

    const visceral = body.items.find((row: { label: string }) => row.label === 'Visceral Poems');
    expect(visceral).toBeTruthy();
  });

  test('search for UREES', async ({ request }) => {
    const response = await request.get('/api/intelligence/knowledge?q=urees');
    expect(response.ok()).toBeTruthy();
    const body = await response.json();

    expect(body.count).toBeGreaterThan(0);
    const urees = body.items.find((row: { label: string }) => row.label === 'UREES');
    expect(urees).toBeTruthy();
    expect(urees.evidenceUrls.length).toBeGreaterThan(0);
  });

  test('search for Visceral Poems', async ({ request }) => {
    const response = await request.get('/api/intelligence/knowledge?q=visceral');
    expect(response.ok()).toBeTruthy();
    const body = await response.json();

    expect(body.count).toBeGreaterThan(0);
    const visceral = body.items.find((row: { label: string }) => row.label === 'Visceral Poems');
    expect(visceral).toBeTruthy();
    expect(visceral.evidenceUrls.length).toBeGreaterThan(0);
  });

  test('GET /api/intelligence/knowledge returns safe metadata only', async ({ request }) => {
    const response = await request.get('/api/intelligence/knowledge?owner=giuseppe');
    expect(response.ok()).toBeTruthy();
    const body = await response.json();

    for (const item of body.items) {
      expect(item).not.toHaveProperty('accessToken');
      expect(item).not.toHaveProperty('refreshToken');
      expect(item).not.toHaveProperty('clientSecret');
      expect(item).not.toHaveProperty('rawJson');
      expect(item).not.toHaveProperty('metadata');
    }
  });

  test('rejects invalid query parameters', async ({ request }) => {
    const response = await request.get('/api/intelligence/knowledge?knowledgeType=invalid-type');
    expect(response.status()).toBe(400);
  });

  test('intelligence debug page loads', async ({ page }) => {
    await page.goto('/intelligence');
    await expect(page.getByTestId('intelligence-dashboard')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Intelligence Read' })).toBeVisible();
  });
});
