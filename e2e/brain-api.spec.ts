import { test, expect } from '@playwright/test';

test.describe('Giuseppe OS Brain API', () => {
  test('GET /api/brain exposes service metadata without provider details', async ({ request }) => {
    const response = await request.get('/api/brain');
    expect(response.ok()).toBeTruthy();

    const body = await response.json();
    expect(body.status).toBe('ok');
    expect(body.service).toBe('giuseppe-brain');
    expect(body.intents).toEqual(['query', 'decide', 'reflect']);
    expect(body.provider).toBeUndefined();
    expect(body.model).toBeUndefined();
  });

  test('POST /api/brain query returns a structured response', async ({ request }) => {
    const response = await request.post('/api/brain', {
      data: {
        intent: 'query',
        message: 'What is my North Star?'
      }
    });

    expect(response.ok()).toBeTruthy();
    const body = await response.json();

    expect(body.intent).toBe('query');
    expect(typeof body.answer).toBe('string');
    expect(body.answer.length).toBeGreaterThan(0);
    expect(body.answer).toMatch(/North Star/i);
    expect(typeof body.confidence).toBe('number');
    expect(Array.isArray(body.sources)).toBeTruthy();
    expect(body.memoryUpdated).toBe(true);
    expect(body.provider).toBeUndefined();
    expect(body.model).toBeUndefined();
  });

  test('POST /api/brain decide routes through executive brain', async ({ request }) => {
    const response = await request.post('/api/brain', {
      data: {
        intent: 'decide',
        decision: 'investire in ETF',
        reason: 'Voglio comprare libertà futura.'
      }
    });

    expect(response.ok()).toBeTruthy();
    const body = await response.json();

    expect(body.intent).toBe('decide');
    expect(body.answer).toMatch(/Categoria:/);
    expect(body.answer).toMatch(/Prossimo passo:/);
    expect(body.nextAction).toBeTruthy();
    expect(body.provider).toBeUndefined();
  });

  test('POST /api/brain reflect returns awareness-grounded output', async ({ request }) => {
    const response = await request.post('/api/brain', {
      data: {
        intent: 'reflect',
        message: 'Am I drifting from my North Star?'
      }
    });

    expect(response.ok()).toBeTruthy();
    const body = await response.json();

    expect(body.intent).toBe('reflect');
    expect(body.answer.length).toBeGreaterThan(0);
    expect(body.provider).toBeUndefined();
  });
});
