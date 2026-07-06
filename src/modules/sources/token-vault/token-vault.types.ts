import type { SourceProviderId } from '../config/source-config';

export const TOKEN_VAULT_STORE_BACKENDS = ['memory', 'file', 'supabase'] as const;

export type TokenVaultStoreBackend = (typeof TOKEN_VAULT_STORE_BACKENDS)[number];

/** Full persisted record — encrypted fields only; server-side store. */
export type PersistedOAuthTokenRecord = {
  sourceId: SourceProviderId;
  provider: string;
  providerAccountId: string;
  encryptedAccessToken: string;
  encryptedRefreshToken: string | null;
  tokenType: string;
  scopes: string[];
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
  revokedAt: string | null;
};

/** Safe metadata for APIs and logs — never includes token values. */
export type SafeTokenMetadata = {
  sourceId: SourceProviderId;
  provider: string;
  providerAccountId: string;
  tokenType: string;
  scopes: string[];
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
  revokedAt: string | null;
  hasRefreshToken: boolean;
};

/** Server-only decrypted bundle returned from getValidTokenBundle. */
export type DecryptedTokenBundle = {
  sourceId: SourceProviderId;
  provider: string;
  providerAccountId: string;
  accessToken: string;
  refreshToken: string | null;
  tokenType: string;
  scopes: string[];
  expiresAt: string | null;
};

export type SaveTokenBundleInput = {
  sourceId: SourceProviderId;
  provider: string;
  providerAccountId: string;
  accessToken: string;
  refreshToken?: string | null;
  tokenType: string;
  scopes: string[];
  expiresAt?: string | null;
};

export type TokenVaultStore = {
  backend: TokenVaultStoreBackend;
  getBySourceId(sourceId: SourceProviderId): Promise<PersistedOAuthTokenRecord | null>;
  upsert(record: PersistedOAuthTokenRecord): Promise<PersistedOAuthTokenRecord>;
  deleteBySourceId(sourceId: SourceProviderId): Promise<boolean>;
  listAll(): Promise<PersistedOAuthTokenRecord[]>;
  resetForTests(): Promise<void>;
};

export class TokenVaultError extends Error {
  readonly code: string;

  constructor(message: string, code = 'token_vault_error') {
    super(message);
    this.name = 'TokenVaultError';
    this.code = code;
  }
}

export function toSafeTokenMetadata(record: PersistedOAuthTokenRecord): SafeTokenMetadata {
  return {
    sourceId: record.sourceId,
    provider: record.provider,
    providerAccountId: record.providerAccountId,
    tokenType: record.tokenType,
    scopes: [...record.scopes],
    expiresAt: record.expiresAt,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    revokedAt: record.revokedAt,
    hasRefreshToken: Boolean(record.encryptedRefreshToken)
  };
}
