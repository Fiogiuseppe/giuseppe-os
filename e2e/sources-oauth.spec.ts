import { test, expect } from '@playwright/test';
import { OAUTH_ERROR_CODES } from '../src/modules/sources/oauth/oauth-errors';
import { getOAuthRedirectUri } from '../src/modules/sources/oauth/oauth-flow.server';

async function resetStores(request: import('@playwright/test').APIRequestContext) {
  const response = await request.post('/api/test/reset-stores');
  expect(response.ok()).toBeTruthy();
}

test.describe.configure({ mode: 'serial' });

test.describe('Giuseppe OS Sources OAuth — Phase 12', () => {
  test.beforeAll(async ({ request }) => {
    await resetStores(request);
  });

  test('connect route rejects non-OAuth sources', async ({ request }) => {
    const response = await request.get('/api/sources/website_personal/oauth/connect');
    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.code).toBe(OAUTH_ERROR_CODES.UNSUPPORTED_SOURCE);
    expect(body.error).toMatch(/does not support OAuth/i);
    expect(body).not.toHaveProperty('accessToken');
    expect(body).not.toHaveProperty('refreshToken');
    expect(body).not.toHaveProperty('clientSecret');
  });

  test('connect route rejects OAuth sources without implemented provider', async ({ request }) => {
    const response = await request.get('/api/sources/instagram_personal/oauth/connect');
    expect(response.status()).toBe(501);
    const body = await response.json();
    expect(body.code).toBe(OAUTH_ERROR_CODES.PROVIDER_NOT_IMPLEMENTED);
    expect(body.error).toMatch(/not implemented/i);
    expect(body).not.toHaveProperty('accessToken');
    expect(body).not.toHaveProperty('refreshToken');
  });

  test('POST connect on OAuth source directs users to authorize route', async ({ request }) => {
    const response = await request.post('/api/sources', {
      data: { sourceId: 'instagram_personal', action: 'connect' }
    });
    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toMatch(/authorize route/i);
    expect(body).not.toHaveProperty('accessToken');
  });

  test('callback rejects missing state', async ({ request }) => {
    const response = await request.get('/api/sources/oauth/callback?code=test-code', {
      maxRedirects: 0
    });
    expect(response.status()).toBe(302);
    const location = response.headers()['location'] ?? '';
    expect(location).toContain('oauth_error');
    expect(location).toMatch(/missing_state/i);
  });

  test('callback rejects invalid state', async ({ request }) => {
    const response = await request.get(
      '/api/sources/oauth/callback?code=test-code&state=invalid-state-value',
      {
        headers: {
          cookie: 'giuseppe_sources_oauth_state=different-state-value'
        },
        maxRedirects: 0
      }
    );
    expect(response.status()).toBe(302);
    const location = response.headers()['location'] ?? '';
    expect(location).toContain('oauth_error');
    expect(location).toMatch(/state_mismatch/i);
  });

  test('callback rejects expired state', async ({ request }) => {
    const seed = await request.post('/api/test/seed-oauth-state', {
      data: { sourceId: 'instagram_personal', expired: true }
    });
    expect(seed.ok()).toBeTruthy();
    const seedBody = await seed.json();
    const cookie = seed.headers()['set-cookie'] ?? '';

    const response = await request.get(
      `/api/sources/oauth/callback?code=test-code&state=${seedBody.state}`,
      {
        headers: { cookie },
        maxRedirects: 0
      }
    );
    expect(response.status()).toBe(302);
    const location = response.headers()['location'] ?? '';
    expect(location).toContain('oauth_error');
    expect(location).toMatch(/state_expired/i);
  });

  test('callback rejects reused state', async ({ request }) => {
    const seed = await request.post('/api/test/seed-oauth-state', {
      data: { sourceId: 'instagram_personal' }
    });
    expect(seed.ok()).toBeTruthy();
    const seedBody = await seed.json();
    const cookie = seed.headers()['set-cookie'] ?? '';

    const first = await request.get(
      `/api/sources/oauth/callback?code=test-code&state=${seedBody.state}`,
      {
        headers: { cookie },
        maxRedirects: 0
      }
    );
    expect(first.status()).toBe(302);

    const second = await request.get(
      `/api/sources/oauth/callback?code=test-code&state=${seedBody.state}`,
      {
        headers: { cookie },
        maxRedirects: 0
      }
    );
    expect(second.status()).toBe(302);
    const location = second.headers()['location'] ?? '';
    expect(location).toContain('oauth_error');
  });

  test('oauth routes never expose token fields', async ({ request }) => {
    const connect = await request.get('/api/sources/linkedin_personal/oauth/connect');
    const connectBody = await connect.json();
    expect(connectBody).not.toHaveProperty('accessToken');
    expect(connectBody).not.toHaveProperty('refreshToken');
    expect(connectBody).not.toHaveProperty('clientSecret');

    const callback = await request.get('/api/sources/oauth/callback?code=test', {
      maxRedirects: 0
    });
    expect(callback.headers()['location']).not.toContain('accessToken');
    expect(getOAuthRedirectUri()).toContain('/api/sources/oauth/callback');
  });
});
