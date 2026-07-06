import { test, expect } from '@playwright/test';
import { BRAIN_UNKNOWN_ANSWER } from '../src/modules/brain/answer/brain-answer.types';

async function resetStores(request: import('@playwright/test').APIRequestContext) {
  const response = await request.post('/api/test/reset-stores');
  expect(response.ok()).toBeTruthy();
}

async function seedWebsiteKnowledge(request: import('@playwright/test').APIRequestContext) {
  await request.post('/api/sources', {
    data: { sourceId: 'website_personal', action: 'connect' }
  });
  await request.post('/api/sources', {
    data: { sourceId: 'website_personal', action: 'sync' }
  });
}

test.describe.configure({ mode: 'serial' });

test.describe('Giuseppe OS Brain Evidence Answer — Phase 6', () => {
  test.beforeAll(async ({ request }) => {
    await resetStores(request);
    await seedWebsiteKnowledge(request);
  });

  test('POST /api/brain/answer works', async ({ request }) => {
    const response = await request.post('/api/brain/answer', {
      data: { question: 'What does Giuseppe OS know about UREES?' }
    });
    expect(response.ok()).toBeTruthy();
    const body = await response.json();

    expect(typeof body.answer).toBe('string');
    expect(body.answer.length).toBeGreaterThan(0);
    expect(body.mode).toBe('deterministic_evidence_answer');
    expect(typeof body.confidence).toBe('number');
    expect(Array.isArray(body.evidence)).toBeTruthy();
  });

  test('answers questions about UREES using existing knowledge', async ({ request }) => {
    const response = await request.post('/api/brain/answer', {
      data: { question: 'What does Giuseppe OS know about UREES?' }
    });
    const body = await response.json();

    expect(body.answer).toMatch(/UREES/i);
    expect(body.evidence.length).toBeGreaterThan(0);
    const urees = body.evidence.find((row: { label: string }) => row.label === 'UREES');
    expect(urees).toBeTruthy();
    expect(urees.evidenceUrls.length).toBeGreaterThan(0);
    expect(body.confidence).toBeGreaterThan(0);
  });

  test('answers questions about Visceral Poems using existing knowledge', async ({ request }) => {
    const response = await request.post('/api/brain/answer', {
      data: { question: 'Tell me about Visceral Poems' }
    });
    const body = await response.json();

    expect(body.answer).toMatch(/Visceral Poems/i);
    expect(body.evidence.length).toBeGreaterThan(0);
    const visceral = body.evidence.find((row: { label: string }) => row.label === 'Visceral Poems');
    expect(visceral).toBeTruthy();
    expect(visceral.evidenceUrls.length).toBeGreaterThan(0);
  });

  test('answers what projects Giuseppe has from knowledgeType=project', async ({ request }) => {
    const response = await request.post('/api/brain/answer', {
      data: { question: 'What projects does Giuseppe have?' }
    });
    const body = await response.json();

    expect(body.answer).toMatch(/project/i);
    expect(body.answer).toMatch(/Visceral Poems/i);
    expect(body.query.knowledgeType).toBe('project');
    for (const item of body.evidence) {
      expect(item.knowledgeType).toBe('project');
      expect(item.evidenceUrls.length).toBeGreaterThan(0);
    }
  });

  test('includes evidence URLs in every evidence item', async ({ request }) => {
    const response = await request.post('/api/brain/answer', {
      data: { question: 'What does Giuseppe OS know about UREES?' }
    });
    const body = await response.json();

    for (const item of body.evidence) {
      expect(item.evidenceUrls.length).toBeGreaterThan(0);
    }
  });

  test('returns unknown answer when no synchronized knowledge exists', async ({ request }) => {
    await resetStores(request);

    const response = await request.post('/api/brain/answer', {
      data: { question: 'What does Giuseppe OS know about UREES?' }
    });
    const body = await response.json();

    expect(body.answer).toBe(BRAIN_UNKNOWN_ANSWER);
    expect(body.confidence).toBe(0);
    expect(body.evidence).toEqual([]);
    expect(body.mode).toBe('deterministic_evidence_answer');

    await seedWebsiteKnowledge(request);
  });

  test('POST /api/brain/answer returns safe metadata only', async ({ request }) => {
    const response = await request.post('/api/brain/answer', {
      data: { question: 'What projects does Giuseppe have?' }
    });
    const body = await response.json();

    expect(body).not.toHaveProperty('accessToken');
    expect(body).not.toHaveProperty('refreshToken');
    expect(body).not.toHaveProperty('clientSecret');
    expect(body).not.toHaveProperty('rawJson');

    for (const item of body.evidence) {
      expect(item).not.toHaveProperty('metadata');
      expect(item).not.toHaveProperty('accessToken');
      expect(item).not.toHaveProperty('refreshToken');
    }
  });

  test('rejects empty question', async ({ request }) => {
    const response = await request.post('/api/brain/answer', {
      data: { question: '   ' }
    });
    expect(response.status()).toBe(400);
  });

  test('brain debug page loads', async ({ page }) => {
    await page.goto('/brain');
    await expect(page.getByTestId('brain-dashboard')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Brain Evidence Answer' })).toBeVisible();
  });
});
