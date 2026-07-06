import { test, expect } from '@playwright/test';

async function resetStores(request: import('@playwright/test').APIRequestContext) {
  const response = await request.post('/api/test/reset-stores');
  expect(response.ok()).toBeTruthy();
}

const SOURCE_COUNT = 6;
const SOURCE_IDS = [
  'instagram_personal',
  'linkedin_personal',
  'medium_personal',
  'website_personal',
  'instagram_urees',
  'website_urees'
] as const;

test.describe.configure({ mode: 'serial' });

test.describe('Giuseppe OS Sources — Phase 3 website connector', () => {
  test.beforeAll(async ({ request }) => {
    await resetStores(request);
  });

  test('failed sync creates error state and failed sync log', async ({ request }) => {
    await resetStores(request);

    await request.post('/api/sources', {
      data: { sourceId: 'medium_personal', action: 'connect' }
    });

    const sync = await request.post('/api/sources', {
      data: { sourceId: 'medium_personal', action: 'sync', simulateFailure: true }
    });
    expect(sync.ok()).toBeTruthy();
    const body = await sync.json();
    expect(body.source.healthStatus).toBe('unavailable');
    expect(body.source.lastSyncRun?.status).toBe('failed');

    await expect
      .poll(
        async () => {
          const runs = await request.get('/api/sources/medium_personal/sync-runs');
          if (!runs.ok()) {
            return undefined;
          }
          const runBody = await runs.json();
          return runBody.runs[0]?.status as string | undefined;
        },
        { timeout: 5_000 }
      )
      .toBe('failed');
  });

  test('GET /api/sources returns six safe sources without secrets', async ({ request }) => {
    const response = await request.get('/api/sources');
    expect(response.ok()).toBeTruthy();

    const body = await response.json();
    expect(body.sources.length).toBe(SOURCE_COUNT);

    for (const id of SOURCE_IDS) {
      expect(body.sources.some((row: { id: string }) => row.id === id)).toBeTruthy();
    }

    const website = body.sources.find((row: { id: string }) => row.id === 'website_personal');
    expect(website.authMethod).toBe('feed');
    expect(website).not.toHaveProperty('accessToken');
    expect(website).not.toHaveProperty('refreshToken');
    expect(website).not.toHaveProperty('clientSecret');
  });

  test('Sources page loads with Personal and UREES groups', async ({ page }) => {
    await page.goto('/sources');
    await expect(page.getByTestId('sources-dashboard')).toBeVisible();
    await expect(page.getByTestId('source-group-personal')).toBeVisible();
    await expect(page.getByTestId('source-group-urees')).toBeVisible();

    for (const id of SOURCE_IDS) {
      await expect(page.getByTestId(`source-card-${id}`)).toBeVisible();
    }
  });

  test('website connect, sync, and deduplicated re-sync', async ({ request }) => {
    const connect = await request.post('/api/sources', {
      data: { sourceId: 'website_personal', action: 'connect' }
    });
    expect(connect.ok()).toBeTruthy();
    const connected = await connect.json();
    expect(connected.source.connectionStatus).toBe('connected');

    const sync = await request.post('/api/sources', {
      data: { sourceId: 'website_personal', action: 'sync' }
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

    const runs = await request.get('/api/sources/website_personal/sync-runs');
    expect(runs.ok()).toBeTruthy();
    const runBody = await runs.json();
    expect(runBody.runs.length).toBeGreaterThan(0);
    expect(runBody.runs[0]?.normalized).toBeGreaterThan(0);

    const second = await request.post('/api/sources', {
      data: { sourceId: 'website_personal', action: 'sync' }
    });
    const secondBody = await second.json();
    expect(secondBody.source.lastSyncRun?.normalized).toBe(0);
  });

  test('medium_personal connect, sync, and disconnect', async ({ request }) => {
    const connect = await request.post('/api/sources', {
      data: { sourceId: 'medium_personal', action: 'connect' }
    });
    expect(connect.ok()).toBeTruthy();
    const connected = await connect.json();
    expect(connected.source.connectionStatus).toBe('connected');
    expect(connected.message).toMatch(/Drafts are unsupported/i);

    const sync = await request.post('/api/sources', {
      data: { sourceId: 'medium_personal', action: 'sync' }
    });
    expect(sync.ok()).toBeTruthy();
    const synced = await sync.json();
    expect(synced.source.lastSyncRun?.status).toBe('success');
    expect(synced.source.lastSyncRun?.fetched).toBeGreaterThan(0);
    expect(synced.source.lastSyncRun?.normalized).toBeGreaterThan(0);
    expect(synced.source.lastSyncRun?.evidence).toBeGreaterThan(0);
    expect(synced.message).toMatch(/Drafts are unsupported/i);

    const disconnect = await request.post('/api/sources', {
      data: { sourceId: 'medium_personal', action: 'disconnect' }
    });
    expect(disconnect.ok()).toBeTruthy();
    const disconnected = await disconnect.json();
    expect(disconnected.source.connectionStatus).toBe('disconnected');
  });
});
