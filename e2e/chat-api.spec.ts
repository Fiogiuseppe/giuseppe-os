import { test, expect } from '@playwright/test';

test.describe('Giuseppe OS Chat API (Ollama)', () => {
  test('GET /api/chat exposes local Ollama metadata', async ({ request }) => {
    const response = await request.get('/api/chat');
    expect(response.ok()).toBeTruthy();

    const body = await response.json();
    expect(body.status).toBe('ok');
    expect(body.service).toBe('giuseppe-chat');
    expect(body.provider).toBe('ollama');
    expect(body.model).toBe('qwen3:8b');
    expect(body.endpoint).toBe('http://localhost:11434/api/chat');
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

  test('POST /api/chat returns a helpful error when Ollama is unavailable', async ({ request }) => {
    const response = await request.post('/api/chat', {
      data: { message: 'Hello from Giuseppe OS tests.' }
    });

    if (response.ok()) {
      const body = await response.json();
      expect(typeof body.reply).toBe('string');
      expect(body.reply.length).toBeGreaterThan(0);
      return;
    }

    expect(response.status()).toBe(503);
    const body = await response.json();
    expect(body.error).toMatch(/ollama/i);
  });
});
