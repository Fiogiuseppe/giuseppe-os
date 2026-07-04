import { test, expect } from '@playwright/test';

test.describe('Decision Learning Loop API', () => {
  test('returns null when no review is due', async ({ request }) => {
    const response = await request.get('/api/decisions/reviews/due');
    expect(response.ok()).toBeTruthy();

    const body = await response.json();
    expect(body.due).toBeNull();
  });

  test('submits a lightweight outcome review and clears due queue', async ({ request }) => {
    const seedResponse = await request.post('/api/test/seed-due-review');
    expect(seedResponse.ok()).toBeTruthy();

    const dueResponse = await request.get('/api/decisions/reviews/due');
    const dueBody = await dueResponse.json();
    expect(dueBody.due?.id).toBe('decision_test_review');

    const submitResponse = await request.post('/api/decisions/reviews/submit', {
      data: {
        decisionId: 'decision_test_review',
        didIt: 'yes',
        satisfaction: 5,
        sameDecision: 'yes',
        locale: 'it'
      }
    });

    expect(submitResponse.ok()).toBeTruthy();
    const submitBody = await submitResponse.json();
    expect(submitBody.decision.status).toBe('reviewed');
    expect(submitBody.decision.outcomeRating).toBe(5);

    const cleared = await request.get('/api/decisions/reviews/due');
    const clearedBody = await cleared.json();
    expect(clearedBody.due).toBeNull();
  });
});
