import { test, expect } from '@playwright/test';
import { MEDIUM_BIO_BLOCK } from '../lib/content/rules';

test.describe('Giuseppe OS content generator API', () => {
  test('POST /api/content/generate returns mock Medium, LinkedIn, and Instagram formats', async ({ request }) => {
    const seedResponse = await request.post('/api/test/seed-reviewed-decision');
    expect(seedResponse.ok()).toBeTruthy();

    const response = await request.post('/api/content/generate', {
      data: {
        sourceType: 'decision',
        sourceId: 'decision_test_content',
        formats: ['medium', 'linkedin', 'instagram-story']
      }
    });

    expect(response.ok()).toBeTruthy();
    const body = await response.json();

    expect(body.source).toBe('mock');
    expect(typeof body.medium).toBe('string');
    expect(body.medium).toContain(MEDIUM_BIO_BLOCK);
    expect(typeof body.linkedin).toBe('string');
    expect(Array.isArray(body.instagramStory)).toBeTruthy();
    expect(body.instagramStory.length).toBeGreaterThanOrEqual(3);
  });

  test('POST /api/content/generate requires a freeform topic', async ({ request }) => {
    const response = await request.post('/api/content/generate', {
      data: {
        sourceType: 'freeform',
        formats: ['linkedin']
      }
    });

    expect(response.status()).toBe(400);
  });

  test('POST /api/content/generate supports freeform topics with brain grounding', async ({ request }) => {
    const response = await request.post('/api/content/generate', {
      data: {
        sourceType: 'freeform',
        topic: 'What designing at LEGO is teaching me about play',
        formats: ['linkedin']
      }
    });

    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.source).toBe('mock');
    expect(body.linkedin).toMatch(/LEGO|decision|week/i);
  });
});
