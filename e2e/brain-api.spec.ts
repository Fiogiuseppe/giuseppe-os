import { test, expect } from '@playwright/test';

const INTENTS = ['query', 'decide', 'reflect', 'awareness', 'potential', 'learn'];

test.describe('Giuseppe OS Brain API', () => {
  test('GET /api/brain exposes intelligence foundation metadata', async ({ request }) => {
    const response = await request.get('/api/brain');
    expect(response.ok()).toBeTruthy();

    const body = await response.json();
    expect(body.status).toBe('ok');
    expect(body.service).toBe('giuseppe-brain');
    expect(body.version).toBe('1.0-intelligence-foundation');
    expect(body.intents).toEqual(INTENTS);
    expect(body.architecture).toContain('executive-brain');
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
    expect(body.answer).toMatch(/North Star/i);
    expect(typeof body.confidence).toBe('number');
    expect(Array.isArray(body.sources)).toBeTruthy();
    expect(Array.isArray(body.slicesUsed)).toBeTruthy();
    expect(body.slicesUsed).toContain('identity');
    expect(Array.isArray(body.engines)).toBeTruthy();
    expect(body.memoryUpdated).toBe(true);
    expect(typeof body.missionAligned).toBe('boolean');
    expect(body.provider).toBeUndefined();
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
    expect(body.engines).toContain('decision');
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
    expect(body.engines).toContain('awareness');
    expect(body.provider).toBeUndefined();
  });

  test('POST /api/brain awareness returns proactive insight', async ({ request }) => {
    const response = await request.post('/api/brain', {
      data: {
        intent: 'awareness',
        message: 'Scan for patterns and risks.'
      }
    });

    expect(response.ok()).toBeTruthy();
    const body = await response.json();

    expect(body.intent).toBe('awareness');
    expect(body.headline).toBe('I noticed something.');
    expect(body.awareness?.signalType).toBeTruthy();
    expect(body.engines).toContain('awareness');
  });

  test('POST /api/brain potential returns aligned opportunity', async ({ request }) => {
    const response = await request.post('/api/brain', {
      data: {
        intent: 'potential',
        message: 'What should I focus on today?'
      }
    });

    expect(response.ok()).toBeTruthy();
    const body = await response.json();

    expect(body.intent).toBe('potential');
    expect(body.opportunity?.title).toBeTruthy();
    expect(body.opportunity?.reason).toBeTruthy();
    expect(body.opportunity?.firstAction).toBeTruthy();
    expect(body.opportunity?.confidenceScore).toBeGreaterThanOrEqual(0);
    expect(body.engines).toContain('potential');
  });

  test('POST /api/brain learn returns learning report', async ({ request }) => {
    const response = await request.post('/api/brain', {
      data: {
        intent: 'learn',
        message: 'Analyze my patterns and lessons.'
      }
    });

    expect(response.ok()).toBeTruthy();
    const body = await response.json();

    expect(body.intent).toBe('learn');
    expect(body.learning?.patterns).toBeTruthy();
    expect(body.learning?.lessons).toBeTruthy();
    expect(body.engines).toContain('learning');
  });

  test('POST /api/brain auto detects decide intent for wrangler purchase', async ({ request }) => {
    const response = await request.post('/api/brain', {
      data: {
        intent: 'auto',
        message: 'Should I buy a Wrangler for freedom and travel?'
      }
    });

    expect(response.ok()).toBeTruthy();
    const body = await response.json();

    expect(body.intent).toBe('decide');
    expect(body.slicesUsed).toContain('identity');
    expect(body.slicesUsed).toContain('finance');
  });
});
