import { test, expect } from '@playwright/test';

test.describe('Giuseppe OS insights API', () => {
  test('POST /api/insights returns monthly local insight', async ({ request }) => {
    const response = await request.post('/api/insights', {
      data: { locale: 'it' }
    });

    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.insight).toBeTruthy();
    expect(body.source).toBe('local');
    expect(typeof body.monthKey).toBe('string');
  });

  test('POST /api/insights reuses monthly cache on repeat', async ({ request }) => {
    const first = await request.post('/api/insights', { data: { locale: 'it' } });
    const second = await request.post('/api/insights', { data: { locale: 'it' } });

    const firstBody = await first.json();
    const secondBody = await second.json();

    expect(firstBody.insight.insight).toBe(secondBody.insight.insight);
    expect(secondBody.cached).toBe(true);
  });

  test('POST /api/insights regenerate is blocked when AI is mock', async ({ request }) => {
    const response = await request.post('/api/insights', {
      data: { locale: 'it', regenerate: true }
    });

    expect(response.status()).toBe(403);
  });
});
