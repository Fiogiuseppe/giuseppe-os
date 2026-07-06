import { test, expect } from '@playwright/test';

async function resetStores(request: import('@playwright/test').APIRequestContext) {
  const response = await request.post('/api/test/reset-stores');
  expect(response.ok()).toBeTruthy();
}

test.describe.configure({ mode: 'serial' });

test.describe('Giuseppe OS Knowledge — Phase 4', () => {
  test.beforeAll(async ({ request }) => {
    await resetStores(request);
  });
  test('website sync creates knowledge from evidence', async ({ request }) => {
    await request.post('/api/sources', {
      data: { sourceId: 'website', action: 'connect' }
    });

    await request.post('/api/sources', {
      data: { sourceId: 'website', action: 'sync' }
    });

    const knowledge = await request.get('/api/knowledge');
    expect(knowledge.ok()).toBeTruthy();
    const body = await knowledge.json();

    const visceral = body.items.find((row: { label: string }) => row.label === 'Visceral Poems');
    const urees = body.items.find((row: { label: string }) => row.label === 'UREES');

    expect(visceral).toBeTruthy();
    expect(visceral.knowledgeType).toBe('project');
    expect(visceral.confidence).toBeGreaterThan(0.9);
    expect(visceral.evidenceIds.length).toBeGreaterThan(0);
    expect(visceral.evidenceUrls.length).toBeGreaterThan(0);

    expect(urees).toBeTruthy();
    expect(urees.knowledgeType).toBe('brand');
    expect(urees.evidenceUrls.length).toBeGreaterThan(0);
  });

  test('duplicate website sync does not duplicate knowledge', async ({ request }) => {
    const before = await request.get('/api/knowledge');
    const beforeBody = await before.json();
    const beforeCount = beforeBody.items.length;

    await request.post('/api/sources', {
      data: { sourceId: 'website', action: 'sync' }
    });

    const after = await request.get('/api/knowledge');
    const afterBody = await after.json();
    expect(afterBody.items.length).toBe(beforeCount);

    const visceralMatches = afterBody.items.filter(
      (row: { label: string }) => row.label === 'Visceral Poems'
    );
    expect(visceralMatches.length).toBe(1);
  });

  test('GET /api/knowledge returns safe metadata only', async ({ request }) => {
    const response = await request.get('/api/knowledge');
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

  test('knowledge debug page loads', async ({ page }) => {
    await page.goto('/knowledge');
    await expect(page.getByTestId('knowledge-dashboard')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Knowledge' })).toBeVisible();
  });
});
