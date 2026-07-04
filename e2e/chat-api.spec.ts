import { test, expect } from '@playwright/test';

test.describe('Giuseppe OS Chat API', () => {
  test('GET /api/chat exposes chat service metadata', async ({ request }) => {
    const response = await request.get('/api/chat');
    expect(response.ok()).toBeTruthy();

    const body = await response.json();
    expect(body.status).toBe('ok');
    expect(body.service).toBe('giuseppe-chat');
    expect(['requesty', 'ollama']).toContain(body.provider);
    expect(typeof body.model).toBe('string');
    expect(typeof body.endpoint).toBe('string');
    expect(typeof body.configured).toBe('boolean');
    expect(body.stream).toBe(false);
  });

  test('POST /api/chat rejects empty message', async ({ request }) => {
    const response = await request.post('/api/chat', {
      data: { message: '   ' }
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toMatch(/message/i);
  });

  test('POST /api/chat returns a real reply or a clear provider error', async ({ request }) => {
    const response = await request.post('/api/chat', {
      data: { message: 'Hello from Giuseppe OS tests.' }
    });

    if (response.ok()) {
      const body = await response.json();
      expect(typeof body.reply).toBe('string');
      expect(body.reply.length).toBeGreaterThan(0);
      return;
    }

    expect([502, 503]).toContain(response.status());
    const body = await response.json();
    expect(body.error).toMatch(/requesty|ollama|REQUESTY_API_KEY/i);
  });
});
