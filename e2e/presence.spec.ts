import { test, expect } from '@playwright/test';

test.describe('Giuseppe OS presence engine', () => {
  test('GET /api/presence returns Giuseppe Fioretti canonical channels', async ({ request }) => {
    const response = await request.get('/api/presence?locale=it');
    expect(response.ok()).toBeTruthy();

    const body = await response.json();
    expect(body.identity.displayName).toMatch(/Giuseppe Fioretti/i);
    expect(body.identity.canonicalUrls).toEqual(
      expect.arrayContaining([
        'https://medium.com/@fiogiuseppe',
        'https://fiogiuseppe.com/',
        'https://www.linkedin.com/in/fiogiuseppe/',
        'https://www.instagram.com/fiogiuseppe/',
        'https://urees.shop/',
        'https://www.instagram.com/urees__/'
      ])
    );

    const channelIds = body.channels.map((channel: { id: string }) => channel.id);
    expect(channelIds).toEqual(
      expect.arrayContaining([
        'medium',
        'website',
        'linkedin',
        'instagram',
        'urees_website',
        'urees_instagram'
      ])
    );

    expect(Array.isArray(body.items)).toBeTruthy();
    expect(body.items.length).toBeGreaterThan(0);
    expect(body.narrativeSummary).toMatch(/Medium|fiogiuseppe/i);
  });
});
