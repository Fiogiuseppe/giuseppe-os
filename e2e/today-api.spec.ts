import { test, expect } from '@playwright/test';

test.describe('Today Engine API', () => {
  test('GET /api/today returns structured payload', async ({ request }) => {
    const response = await request.get('/api/today?locale=it');
    expect(response.ok()).toBeTruthy();

    const body = await response.json();
    expect(body.payload?.greeting).toBeTruthy();
    expect(body.payload?.mindful_reflection).toBeTruthy();
    expect(body.payload?.today_focus).toBeTruthy();
    expect(body.payload?.next_action).toBeTruthy();
    expect(body.payload?.risk_or_distraction).toBeTruthy();
    expect(body.payload?.personal_insight).toBeTruthy();
    expect(body.payload?.closing_line).toBeTruthy();
    expect(['live', 'mock', 'fallback']).toContain(body.source);
    expect(typeof body.isFallback).toBe('boolean');
  });
});
