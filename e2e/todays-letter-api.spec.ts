import { test, expect } from '@playwright/test';

test.describe('Giuseppe OS Daily Briefing API', () => {
  test.describe.configure({ mode: 'serial' });

  test('GET /api/todays-letter exposes daily briefing metadata', async ({ request }) => {
    const response = await request.get('/api/todays-letter');
    expect(response.ok()).toBeTruthy();

    const body = await response.json();
    expect(body.status).toBe('ok');
    expect(body.service).toBe('giuseppe-personal-intelligence-os');
    expect(body.version).toBe('1.7.0-daily-briefing');
    expect(body.maxWords).toBe(280);
    expect(body.cache).toBe('daily');
    expect(body.pipeline).toEqual([
      'reality-engine',
      'personal-relevance-engine',
      'trajectory-engine',
      'daily-briefing-generator',
      'quality-engine'
    ]);
  });

  test('POST /api/todays-letter returns a structured daily briefing', async ({ request }) => {
    const response = await request.post('/api/todays-letter');
    expect(response.ok()).toBeTruthy();

    const body = await response.json();

    expect(typeof body.briefing).toBe('string');
    expect(typeof body.letter).toBe('string');
    expect(body.sections.greeting).toMatch(/Good.*Giuseppe|Buon.*Giuseppe/i);
    expect(body.sections.oneBigMove.length).toBeGreaterThan(0);
    expect(body.sections.reality.length).toBeGreaterThan(0);
    expect(body.sections.opportunity.length).toBeGreaterThan(0);
    expect(body.sections.ignore.length).toBeGreaterThan(0);
    expect(body.sections.nourish.length).toBeGreaterThan(0);
    expect(body.sections.reflection.length).toBeGreaterThan(0);
    expect(body.wordCount).toBeLessThanOrEqual(280);
    expect(['requesty', 'gemini', 'fallback', 'mock']).toContain(body.source);
    expect(body.generatedAt).toBeTruthy();
    expect(body.dateKey).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(typeof body.cached).toBe('boolean');
    expect(body.pipeline.realitySignals).toBeGreaterThan(0);
    expect(body.pipeline.relevanceItems).toBeGreaterThan(0);
    expect(body.pipeline.relevanceItems).toBeLessThanOrEqual(3);
    expect(typeof body.pipeline.trajectoryApproved).toBe('number');
    expect(typeof body.pipeline.trajectoryFiltered).toBe('number');
    expect(typeof body.pipeline.trajectoryNote).toBe('string');
    expect(typeof body.pipeline.qualityPassed).toBe('boolean');
    expect(['high', 'medium', 'low']).toContain(body.pipeline.qualityConfidence);
    expect(typeof body.pipeline.qualityNote).toBe('string');
  });

  test('POST /api/todays-letter returns cached briefing on repeat', async ({ request }) => {
    const first = await request.post('/api/todays-letter');
    const second = await request.post('/api/todays-letter');
    expect(first.ok()).toBeTruthy();
    expect(second.ok()).toBeTruthy();

    const a = await first.json();
    const b = await second.json();

    expect(b.cached).toBe(true);
    expect(b.briefing).toBe(a.briefing);
    expect(b.sections).toEqual(a.sections);
  });

  test('POST /api/todays-letter regenerate is blocked when AI is mock', async ({ request }) => {
    const response = await request.post('/api/todays-letter', {
      data: { regenerate: true }
    });

    expect(response.status()).toBe(403);
  });
});
