import { test, expect } from '@playwright/test';

test.describe('Giuseppe OS Decision AI API', () => {
  test('POST /api/decisions/recommend returns structured decision analysis', async ({ request }) => {
    const response = await request.post('/api/decisions/recommend', {
      data: {
        locale: 'it',
        decision: 'pubblicare un post su LinkedIn questa settimana',
        answers: { motivation: 'Voglio mostrare come penso senza perdere tempo.' },
        persist: false
      }
    });

    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.decision).toBeTruthy();
    expect(typeof body.decision.recommendation).toBe('string');
    expect(typeof body.decision.nextAction).toBe('string');
    expect(Array.isArray(body.decision.risks)).toBeTruthy();
    expect(typeof body.decision.emotionalBiasCheck).toBe('string');
    expect(typeof body.decision.alignment).toBe('string');
    expect(Array.isArray(body.decision.missingInformation)).toBeTruthy();
  });
});
