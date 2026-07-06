import { createHash, randomBytes } from 'node:crypto';
import type { SourceProviderId } from '../providers/source-provider.types';

export const OAUTH_STATE_COOKIE = 'giuseppe_sources_oauth_state';
const STATE_TTL_MS = 10 * 60 * 1000;

type PendingOAuthState = {
  providerId: SourceProviderId;
  state: string;
  expiresAt: number;
};

const pendingStates = new Map<string, PendingOAuthState>();

function purgeExpiredStates(): void {
  const now = Date.now();
  for (const [state, entry] of Array.from(pendingStates.entries())) {
    if (entry.expiresAt <= now) {
      pendingStates.delete(state);
    }
  }
}

export function createOAuthState(sourceId: SourceProviderId): string {
  purgeExpiredStates();
  const state = randomBytes(32).toString('hex');
  pendingStates.set(state, {
    providerId: sourceId,
    state,
    expiresAt: Date.now() + STATE_TTL_MS
  });
  return state;
}

export function readOAuthStateCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) {
    return null;
  }

  const parts = cookieHeader.split(';');
  for (const part of parts) {
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
}): PendingOAuthState {
  purgeExpiredStates();

  const stateFromQuery = params.stateFromQuery?.trim();
  const stateFromCookie = readOAuthStateCookie(params.cookieHeader);

  if (!stateFromQuery || !stateFromCookie) {
    throw new Error('Missing OAuth state.');
  }

  if (stateFromQuery !== stateFromCookie) {
    throw new Error('OAuth state mismatch.');
  }

  const pending = pendingStates.get(stateFromQuery);
  if (!pending) {
    throw new Error('OAuth state is invalid or expired.');
  }

  if (pending.expiresAt <= Date.now()) {
    pendingStates.delete(stateFromQuery);
    throw new Error('OAuth state expired.');
  }

  return pending;
}

export function consumeOAuthState(state: string): void {
  pendingStates.delete(state);
}

export function resetOAuthStateForTests(): void {
  pendingStates.clear();
}

export function hashOAuthState(state: string): string {
  return createHash('sha256').update(state).digest('hex');
}
