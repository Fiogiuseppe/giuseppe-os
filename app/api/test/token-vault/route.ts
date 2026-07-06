import {
  deleteTokenBundle,
  getTokenMetadata,
  getValidTokenBundle,
  listTokenMetadata,
  markTokenRevoked,
  saveTokenBundle
} from '../../../../src/modules/sources/token-vault/token-vault.server';
import {
  getPersistedTokenRecordForTests,
  resetTokenVaultStoreForTests
} from '../../../../src/modules/sources/token-vault/token-vault-store.server';
import { isEncryptedTokenPayload } from '../../../../src/modules/sources/token-vault/token-encryption.server';
import { normalizeSourceId, type SourceProviderId } from '../../../../src/modules/sources/config/source-config';
import { isSourceProviderId } from '../../../../src/modules/sources/providers/source-registry';

function isTestRouteEnabled(): boolean {
  return process.env.ALLOW_TEST_ROUTES === '1' || process.env.NODE_ENV === 'test';
}

function parseSourceId(value: unknown): SourceProviderId | null {
  if (typeof value !== 'string') {
    return null;
  }

  const normalized = normalizeSourceId(value);
  if (!normalized || !isSourceProviderId(normalized)) {
    return null;
  }

  return normalized;
}

/** Test-only token vault routes — metadata only, never decrypted tokens. */
export async function POST(request: Request) {
  if (!isTestRouteEnabled()) {
    return Response.json({ error: 'Not found.' }, { status: 404 });
  }

  const body = (await request.json()) as Record<string, unknown>;
  const action = typeof body.action === 'string' ? body.action : '';

  if (action === 'reset') {
    await resetTokenVaultStoreForTests();
    return Response.json({ ok: true });
  }

  const sourceId = parseSourceId(body.sourceId);
  if (!sourceId && action !== 'list') {
    return Response.json({ error: 'Invalid sourceId.' }, { status: 400 });
  }

  if (action === 'save') {
    if (!sourceId) {
      return Response.json({ error: 'Invalid sourceId.' }, { status: 400 });
    }

    const metadata = await saveTokenBundle({
      sourceId,
      provider: typeof body.provider === 'string' ? body.provider : 'test_provider',
      providerAccountId:
        typeof body.providerAccountId === 'string' ? body.providerAccountId : 'test-account',
      accessToken: typeof body.accessToken === 'string' ? body.accessToken : 'fake-access-token',
      refreshToken: typeof body.refreshToken === 'string' ? body.refreshToken : 'fake-refresh-token',
      tokenType: typeof body.tokenType === 'string' ? body.tokenType : 'Bearer',
      scopes: Array.isArray(body.scopes)
        ? body.scopes.filter((scope): scope is string => typeof scope === 'string')
        : ['read'],
      expiresAt: typeof body.expiresAt === 'string' ? body.expiresAt : null
    });

    return Response.json({ ok: true, metadata });
  }

  if (action === 'metadata') {
    const metadata = await getTokenMetadata(sourceId!);
    return Response.json({ ok: true, metadata });
  }

  if (action === 'list') {
    const items = await listTokenMetadata();
    return Response.json({ ok: true, items });
  }

  if (action === 'revoke') {
    const metadata = await markTokenRevoked(sourceId!);
    return Response.json({ ok: true, metadata });
  }

  if (action === 'delete') {
    const deleted = await deleteTokenBundle(sourceId!);
    return Response.json({ ok: true, deleted });
  }

  if (action === 'verify-encryption') {
    const persisted = await getPersistedTokenRecordForTests(sourceId!);
    if (!persisted) {
      return Response.json({ error: 'Token record not found.' }, { status: 404 });
    }

    const plaintextAccess = typeof body.accessToken === 'string' ? body.accessToken : 'fake-access-token';

    return Response.json({
      ok: true,
      encrypted: isEncryptedTokenPayload(persisted.encryptedAccessToken),
      storedDiffersFromPlaintext: persisted.encryptedAccessToken !== plaintextAccess,
      hasRefreshToken: Boolean(persisted.encryptedRefreshToken)
    });
  }

  if (action === 'assert-server-decrypt') {
    const bundle = await getValidTokenBundle(sourceId!);
    const hasAccessToken = Boolean(bundle?.accessToken);
    return Response.json({
      ok: true,
      serverCanDecrypt: hasAccessToken,
      tokenType: bundle?.tokenType ?? null
    });
  }

  return Response.json({ error: 'Unknown action.' }, { status: 400 });
}

export async function GET() {
  if (!isTestRouteEnabled()) {
    return Response.json({ error: 'Not found.' }, { status: 404 });
  }

  const items = await listTokenMetadata();
  return Response.json({ ok: true, items });
}
