import { test, expect } from '@playwright/test';

test.describe("Giuseppe OS Today's Letter API", () => {
  test('GET /api/todays-letter exposes metadata', async ({ request }) => {
    const response = await request.get('/api/todays-letter');
    expect(response.ok()).toBeTruthy();

    const body = await response.json();
    expect(body.status).toBe('ok');
    expect(body.service).toBe('giuseppe-todays-letter');
    expect(body.version).toBe('1.5.0-todays-letter');
    expect(body.maxWords).toBe(250);
  });

  test('POST /api/todays-letter returns a structured letter', async ({ request }) => {
    const response = await request.post('/api/todays-letter');
    expect(response.ok()).toBeTruthy();

    const body = await response.json();

    expect(typeof body.letter).toBe('string');
    expect(body.sections.greeting).toMatch(/Good (morning|afternoon|evening|night) Giuseppe/i);
    expect(body.sections.observation.length).toBeGreaterThan(0);
    expect(body.sections.whyItMatters.length).toBeGreaterThan(0);
    expect(body.sections.recommendation.length).toBeGreaterThan(0);
    expect(body.sections.creativeSuggestion.length).toBeGreaterThan(0);
    expect(body.sections.reflectionQuestion.length).toBeGreaterThan(0);
    expect(body.wordCount).toBeLessThanOrEqual(250);
    expect(['ai', 'fallback']).toContain(body.source);
    expect(body.generatedAt).toBeTruthy();
  });
});
