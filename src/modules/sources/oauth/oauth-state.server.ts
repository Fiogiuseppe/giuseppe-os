import { createHash, randomBytes } from 'node:crypto';
import type { SourceProviderId } from '../config/source-config';
import { OAUTH_ERROR_CODES, OAuthError } from './oauth-errors';
import { OAUTH_STATE_COOKIE, OAUTH_STATE_TTL_MS, type PendingOAuthState } from './oauth.types';

const pendingStates = new Map<string, PendingOAuthState>();

function purgeExpiredStates(): void {
  const now = Date.now();
  for (const [state, entry] of Array.from(pendingStates.entries())) {
    if (entry.expiresAt <= now) {
      pendingStates.delete(state);
    }
  }
}

export function createOAuthState(input: {
  sourceId: SourceProviderId;
  redirectUri: string;
  ttlMs?: number;
}): string {
  purgeExpiredStates();

  const state = randomBytes(32).toString('hex');
  pendingStates.set(state, {
    sourceId: input.sourceId,
    state,
    redirectUri: input.redirectUri,
    expiresAt: Date.now() + (input.ttlMs ?? OAUTH_STATE_TTL_MS)
  });

  return state;
}

export function readOAuthStateCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) {
    return null;
  }

  for (const part of cookieHeader.split(';')) {
    const [name, ...rest] = part.trim().split('=');
    if (name === OAUTH_STATE_COOKIE) {
      return decodeURIComponent(rest.join('='));
    }
  }

  return null;
}

export function validateOAuthState(params: {
  stateFromQuery: string | null;
  cookieHeader: string | null;
  redirectUri: string;
}): PendingOAuthState {
  purgeExpiredStates();

  const stateFromQuery = params.stateFromQuery?.trim();
  const stateFromCookie = readOAuthStateCookie(params.cookieHeader);

  if (!stateFromQuery || !stateFromCookie) {
    throw new OAuthError(OAUTH_ERROR_CODES.MISSING_STATE, 'Missing OAuth state.', 400);
  }

  if (stateFromQuery !== stateFromCookie) {
    throw new OAuthError(OAUTH_ERROR_CODES.STATE_MISMATCH, 'OAuth state mismatch.', 400);
  }

  const pending = pendingStates.get(stateFromQuery);
  if (!pending) {
    throw new OAuthError(
      OAUTH_ERROR_CODES.STATE_REUSED,
      'OAuth state is invalid, expired, or already used.',
      400
    );
  }

  if (pending.expiresAt <= Date.now()) {
    pendingStates.delete(stateFromQuery);
    throw new OAuthError(OAUTH_ERROR_CODES.STATE_EXPIRED, 'OAuth state expired.', 400);
  }

  if (pending.redirectUri !== params.redirectUri) {
    throw new OAuthError(OAUTH_ERROR_CODES.STATE_MISMATCH, 'OAuth redirect URI mismatch.', 400);
  }

  return pending;
}

export function consumeOAuthState(state: string): void {
  pendingStates.delete(state);
}

export function hashOAuthState(state: string): string {
  return createHash('sha256').update(state).digest('hex');
}

export function resetOAuthStateForTests(): void {
  pendingStates.clear();
}

/** Test-only helper to seed expired or custom OAuth state entries. */
export function seedOAuthStateForTests(input: {
  sourceId: SourceProviderId;
  redirectUri: string;
  expiresAt?: number;
}): string {
  if (process.env.ALLOW_TEST_ROUTES !== '1' && process.env.NODE_ENV !== 'test') {
    throw new Error('OAuth state seeding is only available in test environments.');
  }

  purgeExpiredStates();
  const state = randomBytes(32).toString('hex');
  pendingStates.set(state, {
    sourceId: input.sourceId,
    state,
    redirectUri: input.redirectUri,
    expiresAt: input.expiresAt ?? Date.now() + OAUTH_STATE_TTL_MS
  });
  return state;
}
