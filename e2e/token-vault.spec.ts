import { test, expect } from '@playwright/test';

const FAKE_ACCESS_TOKEN = 'fake-test-access-token-phase-13';
const FAKE_REFRESH_TOKEN = 'fake-test-refresh-token-phase-13';

async function resetStores(request: import('@playwright/test').APIRequestContext) {
  await request.post('/api/test/reset-stores');
  await request.post('/api/test/token-vault', { data: { action: 'reset' } });
}

test.describe.configure({ mode: 'serial' });

test.describe('Giuseppe OS Token Vault — Phase 13', () => {
  test.beforeEach(async ({ request }) => {
    await resetStores(request);
  });

  test('token is encrypted before storage', async ({ request }) => {
    const save = await request.post('/api/test/token-vault', {
      data: {
        action: 'save',
        sourceId: 'instagram_personal',
        provider: 'instagram',
        providerAccountId: 'test-account',
        accessToken: FAKE_ACCESS_TOKEN,
        refreshToken: FAKE_REFRESH_TOKEN
      }
    });
    expect(save.ok()).toBeTruthy();

    const verify = await request.post('/api/test/token-vault', {
      data: {
        action: 'verify-encryption',
        sourceId: 'instagram_personal',
        accessToken: FAKE_ACCESS_TOKEN
      }
    });
    const body = await verify.json();
    expect(body.encrypted).toBe(true);
    expect(body.storedDiffersFromPlaintext).toBe(true);
  });

  test('decrypted token is available only server-side', async ({ request }) => {
    await request.post('/api/test/token-vault', {
      data: {
        action: 'save',
        sourceId: 'instagram_personal',
        accessToken: FAKE_ACCESS_TOKEN
      }
    });

    const decrypt = await request.post('/api/test/token-vault', {
      data: { action: 'assert-server-decrypt', sourceId: 'instagram_personal' }
    });
    const body = await decrypt.json();
    expect(body.serverCanDecrypt).toBe(true);
    expect(body).not.toHaveProperty('accessToken');
    expect(body).not.toHaveProperty('refreshToken');
  });

  test('public metadata excludes token values', async ({ request }) => {
    await request.post('/api/test/token-vault', {
      data: {
        action: 'save',
        sourceId: 'linkedin_personal',
        provider: 'linkedin',
        providerAccountId: 'linkedin-test',
        accessToken: FAKE_ACCESS_TOKEN,
        refreshToken: FAKE_REFRESH_TOKEN
      }
    });

    const metadata = await request.post('/api/test/token-vault', {
      data: { action: 'metadata', sourceId: 'linkedin_personal' }
    });
    const body = await metadata.json();

    expect(body.metadata.sourceId).toBe('linkedin_personal');
    expect(body.metadata.provider).toBe('linkedin');
    expect(body.metadata.hasRefreshToken).toBe(true);
    expect(body.metadata).not.toHaveProperty('accessToken');
    expect(body.metadata).not.toHaveProperty('refreshToken');
    expect(body.metadata).not.toHaveProperty('encryptedAccessToken');
    expect(body.metadata).not.toHaveProperty('clientSecret');
  });

  test('revoke marks token revoked', async ({ request }) => {
    await request.post('/api/test/token-vault', {
      data: {
        action: 'save',
        sourceId: 'instagram_personal',
        accessToken: FAKE_ACCESS_TOKEN
      }
    });

    const revoke = await request.post('/api/test/token-vault', {
      data: { action: 'revoke', sourceId: 'instagram_personal' }
    });
    const body = await revoke.json();
    expect(body.metadata.revokedAt).toBeTruthy();

    const decrypt = await request.post('/api/test/token-vault', {
      data: { action: 'assert-server-decrypt', sourceId: 'instagram_personal' }
    });
    const decryptBody = await decrypt.json();
    expect(decryptBody.serverCanDecrypt).toBe(false);
  });

  test('delete removes token', async ({ request }) => {
    await request.post('/api/test/token-vault', {
      data: {
        action: 'save',
        sourceId: 'instagram_urees',
        accessToken: FAKE_ACCESS_TOKEN
      }
    });

    const deleted = await request.post('/api/test/token-vault', {
      data: { action: 'delete', sourceId: 'instagram_urees' }
    });
    expect((await deleted.json()).deleted).toBe(true);

    const metadata = await request.post('/api/test/token-vault', {
      data: { action: 'metadata', sourceId: 'instagram_urees' }
    });
    const body = await metadata.json();
    expect(body.metadata).toBeNull();
  });

  test('GET token vault route returns metadata only', async ({ request }) => {
    await request.post('/api/test/token-vault', {
      data: {
        action: 'save',
        sourceId: 'instagram_personal',
        accessToken: FAKE_ACCESS_TOKEN
      }
    });

    const response = await request.get('/api/test/token-vault');
    const body = await response.json();
    expect(body.items.length).toBeGreaterThan(0);

    for (const item of body.items) {
      expect(item).not.toHaveProperty('accessToken');
      expect(item).not.toHaveProperty('refreshToken');
      expect(item).not.toHaveProperty('encryptedAccessToken');
    }
  });

  test('missing encryption key fails safely in production', async () => {
    const { productionRequiresEncryptionKey } = await import(
      '../src/modules/sources/token-vault/token-encryption.server'
    );

    expect(productionRequiresEncryptionKey({ nodeEnv: 'production', encryptionKey: '' })).toBe(true);
    expect(productionRequiresEncryptionKey({ nodeEnv: 'production', encryptionKey: undefined })).toBe(
      true
    );
    expect(productionRequiresEncryptionKey({ nodeEnv: 'development', encryptionKey: '' })).toBe(
      false
    );
    expect(
      productionRequiresEncryptionKey({ nodeEnv: 'production', encryptionKey: 'configured-key' })
    ).toBe(false);
  });

  test('oauth routes still expose no token fields', async ({ request }) => {
    const connect = await request.get('/api/sources/instagram_personal/oauth/connect');
    const connectBody = await connect.json();
    expect(connectBody).not.toHaveProperty('accessToken');
    expect(connectBody).not.toHaveProperty('refreshToken');
    expect(connectBody).not.toHaveProperty('clientSecret');

    const callback = await request.get('/api/sources/oauth/callback?code=test', {
      maxRedirects: 0
    });
    expect(callback.headers()['location']).not.toContain('accessToken');
  });
});
