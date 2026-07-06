import { test, expect } from '@playwright/test';
import { BRAIN_UNKNOWN_SUMMARY } from '../src/modules/brain/summary/brain-summary.types';

async function resetStores(request: import('@playwright/test').APIRequestContext) {
  const response = await request.post('/api/test/reset-stores');
  expect(response.ok()).toBeTruthy();
}

async function seedAllRealSources(request: import('@playwright/test').APIRequestContext) {
  for (const sourceId of ['website_personal', 'website_urees', 'medium_personal'] as const) {
    await request.post('/api/sources', { data: { sourceId, action: 'connect' } });
    await request.post('/api/sources', { data: { sourceId, action: 'sync' } });
  }
}

test.describe.configure({ mode: 'serial' });

test.describe('Giuseppe OS Brain Summary — Phase 10', () => {
  test.beforeAll(async ({ request }) => {
    await resetStores(request);
    await seedAllRealSources(request);
  });

  test('POST /api/brain/summary works for owner giuseppe', async ({ request }) => {
    const response = await request.post('/api/brain/summary', {
      data: { owner: 'giuseppe' }
    });
    expect(response.ok()).toBeTruthy();
    const body = await response.json();

    expect(typeof body.summary).toBe('string');
    expect(body.summary.length).toBeGreaterThan(0);
    expect(body.mode).toBe('deterministic_evidence_summary');
    expect(typeof body.confidence).toBe('number');
    expect(body.confidence).toBeGreaterThan(0);
    expect(Array.isArray(body.groups)).toBeTruthy();
    expect(body.groups.length).toBeGreaterThan(0);
    expect(Array.isArray(body.evidenceUrls)).toBeTruthy();
    expect(body.evidenceUrls.length).toBeGreaterThan(0);
    expect(body.query.owner).toBe('giuseppe');
  });

  test('summarizes UREES topic across sources', async ({ request }) => {
    const response = await request.post('/api/brain/summary', {
      data: { topic: 'UREES' }
    });
    const body = await response.json();

    expect(body.summary).toMatch(/UREES/i);
    expect(body.summary).toMatch(/synchronized evidence/i);
    expect(body.groups.some((group: { sourceId: string }) => group.sourceId === 'website_urees')).toBe(
      true
    );
    expect(body.evidenceUrls.length).toBeGreaterThan(0);
  });

  test('summarizes Medium knowledge by sourceId', async ({ request }) => {
    const response = await request.post('/api/brain/summary', {
      data: { sourceId: 'medium_personal' }
    });
    const body = await response.json();

    expect(body.summary).toMatch(/Medium/i);
    expect(body.groups).toHaveLength(1);
    expect(body.groups[0].sourceId).toBe('medium_personal');
    expect(body.groups[0].items.length).toBeGreaterThan(0);
    for (const item of body.groups[0].items) {
      expect(item.evidenceUrls.length).toBeGreaterThan(0);
    }
    expect(body.evidenceUrls.length).toBeGreaterThan(0);
  });

  test('summarizes website_personal knowledge by sourceId', async ({ request }) => {
    const response = await request.post('/api/brain/summary', {
      data: { sourceId: 'website_personal' }
    });
    const body = await response.json();

    expect(body.summary).toMatch(/fiogiuseppe\.com/i);
    expect(body.groups).toHaveLength(1);
    expect(body.groups[0].sourceId).toBe('website_personal');
    expect(body.groups[0].items.length).toBeGreaterThan(0);
    expect(body.evidenceUrls.length).toBeGreaterThan(0);
  });

  test('groups results by sourceId for owner summary', async ({ request }) => {
    const response = await request.post('/api/brain/summary', {
      data: { owner: 'giuseppe' }
    });
    const body = await response.json();

    const sourceIds = body.groups.map((group: { sourceId: string }) => group.sourceId);
    expect(new Set(sourceIds).size).toBe(sourceIds.length);
    expect(sourceIds).toEqual(expect.arrayContaining(['website_personal', 'website_urees', 'medium_personal']));
  });

  test('summarizes projects by knowledgeType', async ({ request }) => {
    const response = await request.post('/api/brain/summary', {
      data: { knowledgeType: 'project' }
    });
    const body = await response.json();

    expect(body.summary).toMatch(/project/i);
    expect(body.summary).toMatch(/Visceral Poems/i);
    for (const group of body.groups) {
      for (const item of group.items) {
        expect(item.knowledgeType).toBe('project');
        expect(item.evidenceUrls.length).toBeGreaterThan(0);
      }
    }
  });

  test('unknown topic returns honest unknown message', async ({ request }) => {
    const response = await request.post('/api/brain/summary', {
      data: { topic: 'xyzzy-nonexistent-topic-999' }
    });
    const body = await response.json();

    expect(body.summary).toBe(BRAIN_UNKNOWN_SUMMARY);
    expect(body.confidence).toBe(0);
    expect(body.groups).toEqual([]);
    expect(body.evidenceUrls).toEqual([]);
  });

  test('POST /api/brain/summary returns safe metadata only', async ({ request }) => {
    const response = await request.post('/api/brain/summary', {
      data: { owner: 'giuseppe' }
    });
    const body = await response.json();

    expect(body).not.toHaveProperty('accessToken');
    expect(body).not.toHaveProperty('refreshToken');
    expect(body).not.toHaveProperty('clientSecret');
    expect(body).not.toHaveProperty('rawJson');

    for (const group of body.groups) {
      for (const item of group.items) {
        expect(item).not.toHaveProperty('metadata');
        expect(item).not.toHaveProperty('accessToken');
      }
    }
  });

  test('rejects empty summary request', async ({ request }) => {
    const response = await request.post('/api/brain/summary', { data: {} });
    expect(response.status()).toBe(400);
  });
});
