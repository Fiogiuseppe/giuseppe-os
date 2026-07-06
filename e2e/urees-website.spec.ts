import { test, expect } from '@playwright/test';
import { BRAIN_UNKNOWN_ANSWER } from '../src/modules/brain/answer/brain-answer.types';
import { getOfficialSourceUrl } from '../src/modules/sources/config/source-config';

async function resetStores(request: import('@playwright/test').APIRequestContext) {
  const response = await request.post('/api/test/reset-stores');
  expect(response.ok()).toBeTruthy();
}

async function seedUreesWebsiteKnowledge(request: import('@playwright/test').APIRequestContext) {
  await request.post('/api/sources', {
    data: { sourceId: 'website_urees', action: 'connect' }
  });
  await request.post('/api/sources', {
    data: { sourceId: 'website_urees', action: 'sync' }
  });
}

test.describe.configure({ mode: 'serial' });

test.describe('Giuseppe OS UREES Website Connector — Phase 7', () => {
  test.beforeAll(async ({ request }) => {
    await resetStores(request);
  });

  test('website_urees connect, sync, and deduplicated re-sync', async ({ request }) => {
    const connect = await request.post('/api/sources', {
      data: { sourceId: 'website_urees', action: 'connect' }
    });
    expect(connect.ok()).toBeTruthy();
    const connected = await connect.json();
    expect(connected.source.connectionStatus).toBe('connected');

    const sync = await request.post('/api/sources', {
      data: { sourceId: 'website_urees', action: 'sync' }
    });
    expect(sync.ok()).toBeTruthy();
    const synced = await sync.json();
    expect(synced.source.lastSyncRun?.fetched).toBeGreaterThan(0);
    expect(synced.source.lastSyncAt).toBeTruthy();
    expect(synced.source.lastSuccessfulSyncAt).toBeTruthy();
    expect(synced.source.healthStatus).toBe('healthy');
    expect(synced.source.lastSyncRun?.status).toBe('success');
    expect(synced.source.lastSyncRun?.normalized).toBeGreaterThan(0);
    expect(synced.source.lastSyncRun?.evidence).toBeGreaterThan(0);

    const second = await request.post('/api/sources', {
      data: { sourceId: 'website_urees', action: 'sync' }
    });
    const secondBody = await second.json();
    expect(secondBody.source.lastSyncRun?.normalized).toBe(0);
  });

  test('website_urees sync creates UREES knowledge from evidence', async ({ request }) => {
    await seedUreesWebsiteKnowledge(request);

    const knowledge = await request.get('/api/intelligence/knowledge?q=urees');
    expect(knowledge.ok()).toBeTruthy();
    const body = await knowledge.json();

    const urees = body.items.find((row: { label: string }) => row.label === 'UREES');
    expect(urees).toBeTruthy();
    expect(urees.sourceId).toBe('website_urees');
    expect(urees.evidenceUrls.length).toBeGreaterThan(0);
  });

  test('brain can answer UREES questions from synchronized website_urees evidence', async ({
    request
  }) => {
    await seedUreesWebsiteKnowledge(request);

    const response = await request.post('/api/brain/answer', {
      data: { question: 'What does Giuseppe OS know about UREES?' }
    });
    expect(response.ok()).toBeTruthy();
    const body = await response.json();

    expect(body.answer).toMatch(/UREES/i);
    expect(body.answer).not.toBe(BRAIN_UNKNOWN_ANSWER);
    expect(body.evidence.length).toBeGreaterThan(0);
    expect(body.evidence.some((row: { sourceId: string }) => row.sourceId === 'website_urees')).toBe(
      true
    );
  });

  test('GET /api/sources exposes website_urees without secrets', async ({ request }) => {
    const response = await request.get('/api/sources');
    expect(response.ok()).toBeTruthy();
    const body = await response.json();

    const urees = body.sources.find((row: { id: string }) => row.id === 'website_urees');
    expect(urees).toBeTruthy();
    expect(urees.authMethod).toBe('feed');
    expect(urees).not.toHaveProperty('accessToken');
    expect(urees).not.toHaveProperty('refreshToken');
    expect(urees).not.toHaveProperty('clientSecret');
  });
});

test.describe('UREES website official URL', () => {
  test('website_urees uses https://urees.shop/ from source config', async () => {
    const { resolveUreesWebsiteConfig } = await import(
      '../src/modules/sources/connectors/website/website-connector.configs.server'
    );

    expect(getOfficialSourceUrl('website_urees')).toBe('https://urees.shop/');

    const config = resolveUreesWebsiteConfig();
    expect(config.baseUrl).toBe('https://urees.shop/');
    expect(config.sourceId).toBe('website_urees');
  });
});
