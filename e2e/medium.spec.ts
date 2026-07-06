import { test, expect } from '@playwright/test';

async function resetStores(request: import('@playwright/test').APIRequestContext) {
  const response = await request.post('/api/test/reset-stores');
  expect(response.ok()).toBeTruthy();
}

async function seedMediumKnowledge(request: import('@playwright/test').APIRequestContext) {
  await request.post('/api/sources', {
    data: { sourceId: 'medium_personal', action: 'connect' }
  });
  await request.post('/api/sources', {
    data: { sourceId: 'medium_personal', action: 'sync' }
  });
}

test.describe.configure({ mode: 'serial' });

test.describe('Giuseppe OS Medium Connector — Phase 9', () => {
  test.beforeAll(async ({ request }) => {
    await resetStores(request);
  });

  test('medium_personal syncs public Medium articles', async ({ request }) => {
    await seedMediumKnowledge(request);

    const sources = await request.get('/api/sources');
    const body = await sources.json();
    const medium = body.sources.find((row: { id: string }) => row.id === 'medium_personal');
    expect(medium.lastSyncRun?.fetched).toBeGreaterThan(0);
    expect(medium.lastSyncRun?.normalized).toBeGreaterThan(0);
    expect(medium.lastSyncRun?.evidence).toBeGreaterThan(0);
    expect(medium.healthNote).toMatch(/Drafts are unsupported/i);
  });

  test('duplicate medium sync does not duplicate evidence', async ({ request }) => {
    await seedMediumKnowledge(request);

    await request.post('/api/sources', {
      data: { sourceId: 'medium_personal', action: 'sync' }
    });

    const after = await request.post('/api/sources', {
      data: { sourceId: 'medium_personal', action: 'sync' }
    });
    const afterBody = await after.json();
    expect(afterBody.source.lastSyncRun?.normalized).toBe(0);
  });

  test('GET /api/intelligence/knowledge?sourceId=medium_personal returns Medium knowledge', async ({
    request
  }) => {
    await seedMediumKnowledge(request);

    const response = await request.get('/api/intelligence/knowledge?sourceId=medium_personal');
    expect(response.ok()).toBeTruthy();
    const body = await response.json();

    expect(body.count).toBeGreaterThan(0);
    for (const item of body.items) {
      expect(item.sourceId).toBe('medium_personal');
      expect(item.evidenceUrls.length).toBeGreaterThan(0);
    }

    const decision = body.items.find((row: { label: string }) => row.label === 'Decision Intelligence');
    expect(decision).toBeTruthy();
  });

  test('brain can answer questions using Medium knowledge', async ({ request }) => {
    await seedMediumKnowledge(request);

    const response = await request.post('/api/brain/answer', {
      data: { question: 'What does Giuseppe write about Decision Intelligence on Medium?' }
    });
    expect(response.ok()).toBeTruthy();
    const body = await response.json();

    expect(body.answer).toMatch(/Decision Intelligence/i);
    expect(body.evidence.some((row: { sourceId: string }) => row.sourceId === 'medium_personal')).toBe(
      true
    );
    for (const item of body.evidence) {
      expect(item.evidenceUrls.length).toBeGreaterThan(0);
    }
  });

  test('medium API responses expose no secrets', async ({ request }) => {
    await seedMediumKnowledge(request);

    const sources = await request.get('/api/sources');
    const body = await sources.json();
    const medium = body.sources.find((row: { id: string }) => row.id === 'medium_personal');

    expect(medium).not.toHaveProperty('accessToken');
    expect(medium).not.toHaveProperty('refreshToken');
    expect(medium).not.toHaveProperty('clientSecret');

    const knowledge = await request.get('/api/intelligence/knowledge?sourceId=medium_personal');
    const knowledgeBody = await knowledge.json();
    for (const item of knowledgeBody.items) {
      expect(item).not.toHaveProperty('metadata');
      expect(item).not.toHaveProperty('rawJson');
    }
  });
});
