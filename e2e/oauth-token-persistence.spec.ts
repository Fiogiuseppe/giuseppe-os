import { test, expect } from '@playwright/test';
import { TEST_OAUTH_ACCESS_TOKEN } from '../src/modules/sources/oauth/test-oauth-provider.server';

async function resetStores(request: import('@playwright/test').APIRequestContext) {
  const response = await request.post('/api/test/reset-stores');
  expect(response.ok()).toBeTruthy();
}

function callbackPathFromLocation(location: string): string {
  const url = new URL(location);
  return `${url.pathname}${url.search}`;
}

test.describe.configure({ mode: 'serial' });

test.describe('Giuseppe OS OAuth Token Persistence — Phase 14', () => {
  test.beforeEach(async ({ request }) => {
    await resetStores(request);
  });

  test('fake OAuth connect redirects to test authorize route', async ({ request }) => {
    const response = await request.get('/api/sources/instagram_personal/oauth/connect', {
      maxRedirects: 0
    });
    expect(response.status()).toBe(302);

    const location = response.headers()['location'] ?? '';
    expect(location).toContain('/api/test/oauth/authorize');
    expect(location).toContain('state=');
    expect(location).not.toContain('accessToken');
    expect(location).not.toContain('refreshToken');
  });

  test('fake OAuth callback stores encrypted token and connects source', async ({ request }) => {
    const connect = await request.get('/api/sources/instagram_personal/oauth/connect', {
      maxRedirects: 0
    });
    const cookie = connect.headers()['set-cookie'] ?? '';
    const authorizeLocation = connect.headers()['location'] ?? '';

    const authorize = await request.get(callbackPathFromLocation(authorizeLocation), {
      maxRedirects: 0,
      headers: { cookie }
    });
    expect(authorize.status()).toBe(302);

    const callback = await request.get(callbackPathFromLocation(authorize.headers()['location'] ?? ''), {
      maxRedirects: 0,
      headers: { cookie }
    });
    expect(callback.status()).toBe(302);
    expect(callback.headers()['location']).toContain('connected=instagram_personal');
    expect(callback.headers()['location']).not.toContain('accessToken');

    const sources = await request.get('/api/sources');
    const body = await sources.json();
    const instagram = body.sources.find(
      (source: { id: string }) => source.id === 'instagram_personal'
    );

    expect(instagram.connectionStatus).toBe('connected');
    expect(instagram.oauthToken.hasToken).toBe(true);
    expect(instagram.oauthToken.tokenExpiresAt).toBeTruthy();
    expect(instagram.oauthToken.scopes.length).toBeGreaterThan(0);
    expect(instagram).not.toHaveProperty('accessToken');
    expect(instagram).not.toHaveProperty('refreshToken');
    expect(instagram).not.toHaveProperty('clientSecret');

    const verify = await request.post('/api/test/token-vault', {
      data: {
        action: 'verify-encryption',
        sourceId: 'instagram_personal',
        accessToken: TEST_OAUTH_ACCESS_TOKEN
      }
    });
    expect(verify.ok()).toBeTruthy();
    const verifyBody = await verify.json();
    expect(verifyBody.encrypted).toBe(true);
    expect(verifyBody.storedDiffersFromPlaintext).toBe(true);
  });

  test('token metadata appears safely on GET /api/sources', async ({ request }) => {
    const connect = await request.get('/api/sources/linkedin_personal/oauth/connect', {
      maxRedirects: 0
    });
    const cookie = connect.headers()['set-cookie'] ?? '';
    const authorize = await request.get(callbackPathFromLocation(connect.headers()['location'] ?? ''), {
      maxRedirects: 0,
      headers: { cookie }
    });
    await request.get(callbackPathFromLocation(authorize.headers()['location'] ?? ''), {
      maxRedirects: 0,
      headers: { cookie }
    });

    const sources = await request.get('/api/sources');
    const body = await sources.json();
    const linkedin = body.sources.find((source: { id: string }) => source.id === 'linkedin_personal');

    expect(linkedin.oauthToken).toEqual(
      expect.objectContaining({
        hasToken: true,
        tokenExpiresAt: expect.any(String),
        scopes: expect.any(Array)
      })
    );
    expect(linkedin).not.toHaveProperty('accessToken');
    expect(linkedin).not.toHaveProperty('refreshToken');
    expect(linkedin).not.toHaveProperty('encryptedAccessToken');
  });

  test('disconnect revokes token bundle for OAuth source', async ({ request }) => {
    const connect = await request.get('/api/sources/instagram_urees/oauth/connect', {
      maxRedirects: 0
    });
    const cookie = connect.headers()['set-cookie'] ?? '';
    const authorize = await request.get(callbackPathFromLocation(connect.headers()['location'] ?? ''), {
      maxRedirects: 0,
      headers: { cookie }
    });
    await request.get(callbackPathFromLocation(authorize.headers()['location'] ?? ''), {
      maxRedirects: 0,
      headers: { cookie }
    });

    const disconnect = await request.post('/api/sources', {
      data: { sourceId: 'instagram_urees', action: 'disconnect' }
    });
    expect(disconnect.ok()).toBeTruthy();

    const body = await disconnect.json();
    expect(body.source.connectionStatus).toBe('disconnected');
    expect(body.source.oauthToken.hasToken).toBe(false);
    expect(body.source).not.toHaveProperty('accessToken');
    expect(body.source).not.toHaveProperty('refreshToken');

    const metadata = await request.post('/api/test/token-vault', {
      data: { action: 'metadata', sourceId: 'instagram_urees' }
    });
    expect((await metadata.json()).metadata).toBeNull();
  });

  test('feed sources still use POST connect without OAuth redirect', async ({ request }) => {
    const response = await request.post('/api/sources', {
      data: { sourceId: 'medium_personal', action: 'connect' }
    });
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.source.connectionStatus).toBe('connected');
    expect(body.source.authMethod).toBe('feed');
    expect(body).not.toHaveProperty('accessToken');
  });
});
