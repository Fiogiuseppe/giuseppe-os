import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const CACHE_PATH = path.join(process.cwd(), 'memory', 'todays_letter.test.json');

test.describe("Giuseppe OS Today's Letter API", () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(() => {
    try {
      fs.unlinkSync(CACHE_PATH);
    } catch {
      // Cache absent.
    }
  });
  test('GET /api/todays-letter exposes metadata', async ({ request }) => {
    const response = await request.get('/api/todays-letter');
    expect(response.ok()).toBeTruthy();

    const body = await response.json();
    expect(body.status).toBe('ok');
    expect(body.service).toBe('giuseppe-todays-letter');
    expect(body.version).toBe('1.5.1-todays-letter');
    expect(body.maxWords).toBe(200);
    expect(body.cache).toBe('daily');
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
    expect(body.wordCount).toBeLessThanOrEqual(200);
    expect(['anthropic', 'fallback']).toContain(body.source);
    expect(body.generatedAt).toBeTruthy();
    expect(body.dateKey).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(body.cached).toBe(false);
  });

  test('POST /api/todays-letter returns cached letter on repeat', async ({ request }) => {
    const first = await request.post('/api/todays-letter');
    const second = await request.post('/api/todays-letter');
    expect(first.ok()).toBeTruthy();
    expect(second.ok()).toBeTruthy();

    const a = await first.json();
    const b = await second.json();

    expect(b.cached).toBe(true);
    expect(b.letter).toBe(a.letter);
    expect(b.sections).toEqual(a.sections);
  });
});
