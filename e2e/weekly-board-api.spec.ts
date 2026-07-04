import { test, expect } from '@playwright/test';

test.describe('Giuseppe OS Weekly Board API', () => {
  test.describe.configure({ mode: 'serial' });

  test('GET /api/weekly-board exposes weekly board metadata', async ({ request }) => {
    const response = await request.get('/api/weekly-board');
    expect(response.ok()).toBeTruthy();

    const body = await response.json();
    expect(body.status).toBe('ok');
    expect(body.version).toBe('1.0.0-weekly-board');
    expect(body.cache).toBe('iso-week');
    expect(body.pipeline).toEqual(['oracle-evidence', 'weekly-board-generator']);
  });

  test('POST /api/weekly-board returns a structured weekly board', async ({ request }) => {
    const response = await request.post('/api/weekly-board', {
      data: { locale: 'it' }
    });
    expect(response.ok()).toBeTruthy();

    const body = await response.json();
    expect(Array.isArray(body.priorities)).toBeTruthy();
    expect(body.priorities.length).toBeGreaterThan(0);
    expect(body.priorities.length).toBeLessThanOrEqual(3);
    expect(Array.isArray(body.doNotDo)).toBeTruthy();
    expect(body.doNotDo.length).toBeLessThanOrEqual(3);
    expect(typeof body.challenge).toBe('string');
    expect(body.challenge.length).toBeGreaterThan(0);
    expect(typeof body.trajectoryCheck).toBe('string');
    expect(body.trajectoryCheck.length).toBeGreaterThan(0);
    expect(['requesty', 'gemini', 'fallback', 'mock']).toContain(body.source);
    expect(body.weekKey).toMatch(/^\d{4}-W\d{2}$/);
    expect(typeof body.cached).toBe('boolean');
    expect(typeof body.pipeline.thinEvidence).toBe('boolean');
  });

  test('POST /api/weekly-board returns cached board on repeat', async ({ request }) => {
    const first = await request.post('/api/weekly-board', { data: { locale: 'it' } });
    const second = await request.post('/api/weekly-board', { data: { locale: 'it' } });
    expect(first.ok()).toBeTruthy();
    expect(second.ok()).toBeTruthy();

    const a = await first.json();
    const b = await second.json();
    expect(b.cached).toBe(true);
    expect(b.challenge).toBe(a.challenge);
    expect(b.priorities).toEqual(a.priorities);
  });

  test('POST /api/weekly-board regenerate is blocked when AI is mock', async ({ request }) => {
    const response = await request.post('/api/weekly-board', {
      data: { regenerate: true }
    });
    expect(response.status()).toBe(403);
  });
});
