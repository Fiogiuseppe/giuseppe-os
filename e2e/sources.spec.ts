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

test.describe('Giuseppe OS Sources — Phase 2 engine', () => {
  test('GET /api/sources returns six safe sources without secrets', async ({ request }) => {
    const response = await request.get('/api/sources');
    expect(response.ok()).toBeTruthy();

    const body = await response.json();
    expect(body.sources.length).toBe(SOURCE_COUNT);

    for (const id of SOURCE_IDS) {
      expect(body.sources.some((row: { id: string }) => row.id === id)).toBeTruthy();
    }

    const medium = body.sources.find((row: { id: string }) => row.id === 'medium');
    expect(medium.authMethod).toBe('feed');
    expect(medium).not.toHaveProperty('accessToken');
    expect(medium).not.toHaveProperty('refreshToken');
    expect(medium).not.toHaveProperty('clientSecret');
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

  test('connect, sync, and disconnect update backend state', async ({ request }) => {
    const connect = await request.post('/api/sources', {
      data: { sourceId: 'medium', action: 'connect' }
    });
    expect(connect.ok()).toBeTruthy();
    const connected = await connect.json();
    expect(connected.source.connectionStatus).toBe('connected');
    expect(connected.source.permissionsGranted.length).toBeGreaterThan(0);

    const sync = await request.post('/api/sources', {
      data: { sourceId: 'medium', action: 'sync' }
    });
    expect(sync.ok()).toBeTruthy();
    const synced = await sync.json();
    expect(synced.source.lastSyncAt).toBeTruthy();
    expect(synced.source.lastSuccessfulSyncAt).toBeTruthy();
    expect(synced.source.lastSyncRun?.status).toBe('success');

    const runs = await request.get('/api/sources/medium/sync-runs');
    expect(runs.ok()).toBeTruthy();
    const runBody = await runs.json();
    expect(runBody.runs.length).toBeGreaterThan(0);

    const disconnect = await request.post('/api/sources', {
      data: { sourceId: 'medium', action: 'disconnect' }
    });
    expect(disconnect.ok()).toBeTruthy();
    const disconnected = await disconnect.json();
    expect(disconnected.source.connectionStatus).toBe('disconnected');
  });

  test('failed sync creates error state and failed sync log', async ({ request }) => {
    await request.post('/api/sources', {
      data: { sourceId: 'website', action: 'connect' }
    });

    const sync = await request.post('/api/sources', {
      data: { sourceId: 'website', action: 'sync', simulateFailure: true }
    });
    expect(sync.ok()).toBeTruthy();
    const body = await sync.json();
    expect(body.source.healthStatus).toBe('unavailable');
    expect(body.source.lastSyncRun?.status).toBe('failed');

    const runs = await request.get('/api/sources/website/sync-runs');
    const runBody = await runs.json();
    expect(runBody.runs[0]?.status).toBe('failed');
  });
});
