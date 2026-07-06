import { test, expect } from '@playwright/test';
import { BRAIN_UNKNOWN_ANSWER } from '../src/modules/brain/answer/brain-answer.types';

async function resetStores(request: import('@playwright/test').APIRequestContext) {
  const response = await request.post('/api/test/reset-stores');
  expect(response.ok()).toBeTruthy();
}

async function seedUreesWebsiteKnowledge(request: import('@playwright/test').APIRequestContext) {
  await request.post('/api/sources', {
    data: { sourceId: 'urees-website', action: 'connect' }
  });
  await request.post('/api/sources', {
    data: { sourceId: 'urees-website', action: 'sync' }
  });
}

test.describe.configure({ mode: 'serial' });

test.describe('Giuseppe OS UREES Website Connector — Phase 7', () => {
  test.beforeAll(async ({ request }) => {
    await resetStores(request);
  });

  test('urees-website connect, sync, and deduplicated re-sync', async ({ request }) => {
    const connect = await request.post('/api/sources', {
      data: { sourceId: 'urees-website', action: 'connect' }
    });
    expect(connect.ok()).toBeTruthy();
    const connected = await connect.json();
    expect(connected.source.connectionStatus).toBe('connected');

    const sync = await request.post('/api/sources', {
      data: { sourceId: 'urees-website', action: 'sync' }
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
      data: { sourceId: 'urees-website', action: 'sync' }
    });
    const secondBody = await second.json();
    expect(secondBody.source.lastSyncRun?.normalized).toBe(0);
  });

  test('urees-website sync creates UREES knowledge from evidence', async ({ request }) => {
    await seedUreesWebsiteKnowledge(request);

    const knowledge = await request.get('/api/intelligence/knowledge?q=urees');
    expect(knowledge.ok()).toBeTruthy();
    const body = await knowledge.json();

    const urees = body.items.find((row: { label: string }) => row.label === 'UREES');
    expect(urees).toBeTruthy();
    expect(urees.sourceId).toBe('urees-website');
    expect(urees.evidenceUrls.length).toBeGreaterThan(0);
  });

  test('brain can answer UREES questions from synchronized urees-website evidence', async ({
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
    expect(body.evidence.some((row: { sourceId: string }) => row.sourceId === 'urees-website')).toBe(
      true
    );
  });

  test('GET /api/sources exposes urees-website without secrets', async ({ request }) => {
    const response = await request.get('/api/sources');
    expect(response.ok()).toBeTruthy();
    const body = await response.json();

    const urees = body.sources.find((row: { id: string }) => row.id === 'urees-website');
    expect(urees).toBeTruthy();
    expect(urees.authMethod).toBe('feed');
    expect(urees).not.toHaveProperty('accessToken');
    expect(urees).not.toHaveProperty('refreshToken');
    expect(urees).not.toHaveProperty('clientSecret');
  });
});

test.describe('UREES website config safety', () => {
  test('missing UREES_WEBSITE_URL is reported as unavailable', async () => {
    const { resolveUreesWebsiteConfig } = await import(
      '../src/modules/sources/connectors/website/website-connector.configs.server'
    );
    const { fetchConfigurableWebsite } = await import(
      '../src/modules/sources/connectors/website/configurable-website.fetch.server'
    );

    const previousUrl = process.env.UREES_WEBSITE_URL;
    const previousAllow = process.env.ALLOW_TEST_ROUTES;
    const previousMock = process.env.SOURCES_WEBSITE_MOCK_FETCH;

    delete process.env.UREES_WEBSITE_URL;
    delete process.env.ALLOW_TEST_ROUTES;
    delete process.env.SOURCES_WEBSITE_MOCK_FETCH;

    const config = resolveUreesWebsiteConfig();
    expect(config.baseUrl).toBeNull();
    expect(config.configError).toMatch(/UREES_WEBSITE_URL/i);

    const fetched = await fetchConfigurableWebsite(config);
    expect(fetched.items).toEqual([]);
    expect(fetched.errors[0]?.code).toBe('config_missing');

    if (previousUrl !== undefined) {
      process.env.UREES_WEBSITE_URL = previousUrl;
    }
    if (previousAllow !== undefined) {
      process.env.ALLOW_TEST_ROUTES = previousAllow;
    }
    if (previousMock !== undefined) {
      process.env.SOURCES_WEBSITE_MOCK_FETCH = previousMock;
    }
  });
});
