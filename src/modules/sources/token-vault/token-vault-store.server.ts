import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { getSupabaseClient, isSupabaseConfigured } from '../../../../lib/memory/supabase/client';
import type { SourceProviderId } from '../config/source-config';
import type { PersistedOAuthTokenRecord, TokenVaultStore, TokenVaultStoreBackend } from './token-vault.types';

type FileSnapshot = {
  records: PersistedOAuthTokenRecord[];
};

const DATA_DIR = path.join(process.cwd(), '.data', 'token-vault');
const STATE_FILE = path.join(DATA_DIR, 'state.json');

const memoryRecords = new Map<SourceProviderId, PersistedOAuthTokenRecord>();

async function readFileSnapshot(): Promise<FileSnapshot> {
  try {
    const raw = await readFile(STATE_FILE, 'utf8');
    const parsed = JSON.parse(raw) as FileSnapshot;
    return { records: Array.isArray(parsed.records) ? parsed.records : [] };
  } catch {
    return { records: [] };
  }
}

async function writeFileSnapshot(snapshot: FileSnapshot): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(STATE_FILE, JSON.stringify(snapshot, null, 2), 'utf8');
}

type DbTokenRow = {
  source_id: string;
  provider: string;
  provider_account_id: string;
  encrypted_access_token: string;
  encrypted_refresh_token: string | null;
  token_type: string;
  scopes: string[];
  expires_at: string | null;
  created_at: string;
  updated_at: string;
  revoked_at: string | null;
};

function parseDbRow(row: DbTokenRow): PersistedOAuthTokenRecord {
  return {
    sourceId: row.source_id as SourceProviderId,
    provider: row.provider,
    providerAccountId: row.provider_account_id,
    encryptedAccessToken: row.encrypted_access_token,
    encryptedRefreshToken: row.encrypted_refresh_token,
    tokenType: row.token_type,
    scopes: row.scopes ?? [],
    expiresAt: row.expires_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    revokedAt: row.revoked_at
  };
}

function toDbRow(record: PersistedOAuthTokenRecord): DbTokenRow {
  return {
    source_id: record.sourceId,
    provider: record.provider,
    provider_account_id: record.providerAccountId,
    encrypted_access_token: record.encryptedAccessToken,
    encrypted_refresh_token: record.encryptedRefreshToken,
    token_type: record.tokenType,
    scopes: record.scopes,
    expires_at: record.expiresAt,
    created_at: record.createdAt,
    updated_at: record.updatedAt,
    revoked_at: record.revokedAt
  };
}

export function resolveTokenVaultStoreBackend(): TokenVaultStoreBackend {
  if (
    process.env.SOURCES_TOKEN_VAULT_STORE === 'memory' ||
    process.env.SOURCES_ENGINE_STORE === 'memory'
  ) {
    return 'memory';
  }

  if (isSupabaseConfigured()) {
    return 'supabase';
  }

  if (process.env.NODE_ENV === 'test') {
    return 'memory';
  }

  return 'file';
}

const memoryTokenVaultStore: TokenVaultStore = {
  backend: 'memory',

  async getBySourceId(sourceId) {
    return memoryRecords.get(sourceId) ?? null;
  },

  async upsert(record) {
    memoryRecords.set(record.sourceId, record);
    return record;
  },

  async deleteBySourceId(sourceId) {
    return memoryRecords.delete(sourceId);
  },

  async listAll() {
    return Array.from(memoryRecords.values());
  },

  async resetForTests() {
    memoryRecords.clear();
  }
};

const fileTokenVaultStore: TokenVaultStore = {
  backend: 'file',

  async getBySourceId(sourceId) {
    const snapshot = await readFileSnapshot();
    return snapshot.records.find(record => record.sourceId === sourceId) ?? null;
  },

  async upsert(record) {
    const snapshot = await readFileSnapshot();
    const next = snapshot.records.filter(row => row.sourceId !== record.sourceId);
    next.push(record);
    await writeFileSnapshot({ records: next });
    return record;
  },

  async deleteBySourceId(sourceId) {
    const snapshot = await readFileSnapshot();
    const next = snapshot.records.filter(row => row.sourceId !== sourceId);
    const deleted = next.length !== snapshot.records.length;
    await writeFileSnapshot({ records: next });
    return deleted;
  },

  async listAll() {
    const snapshot = await readFileSnapshot();
    return snapshot.records;
  },

  async resetForTests() {
    await writeFileSnapshot({ records: [] });
  }
};

const supabaseTokenVaultStore: TokenVaultStore = {
  backend: 'supabase',

  async getBySourceId(sourceId) {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('source_oauth_tokens')
      .select('*')
      .eq('source_id', sourceId)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    return data ? parseDbRow(data as DbTokenRow) : null;
  },

  async upsert(record) {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('source_oauth_tokens')
      .upsert(toDbRow(record), { onConflict: 'source_id' })
      .select('*')
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return parseDbRow(data as DbTokenRow);
  },

  async deleteBySourceId(sourceId) {
    const client = getSupabaseClient();
    const { error, count } = await client
      .from('source_oauth_tokens')
      .delete({ count: 'exact' })
      .eq('source_id', sourceId);

    if (error) {
      throw new Error(error.message);
    }

    return (count ?? 0) > 0;
  },

  async listAll() {
    const client = getSupabaseClient();
    const { data, error } = await client.from('source_oauth_tokens').select('*');

    if (error) {
      throw new Error(error.message);
    }

    return (data ?? []).map(row => parseDbRow(row as DbTokenRow));
  },

  async resetForTests() {
    const client = getSupabaseClient();
    const { error } = await client.from('source_oauth_tokens').delete().neq('source_id', '');
    if (error) {
      throw new Error(error.message);
    }
  }
};

export function getTokenVaultStore(): TokenVaultStore {
  const backend = resolveTokenVaultStoreBackend();

  if (backend === 'supabase') {
    return supabaseTokenVaultStore;
  }

  if (backend === 'file') {
    return fileTokenVaultStore;
  }

  return memoryTokenVaultStore;
}

export async function resetTokenVaultStoreForTests(): Promise<void> {
  await getTokenVaultStore().resetForTests();
}

/** Test-only: read encrypted record without decrypting. */
export async function getPersistedTokenRecordForTests(
  sourceId: SourceProviderId
): Promise<PersistedOAuthTokenRecord | null> {
  if (process.env.ALLOW_TEST_ROUTES !== '1' && process.env.NODE_ENV !== 'test') {
    throw new Error('Persisted token inspection is only available in test environments.');
  }

  return getTokenVaultStore().getBySourceId(sourceId);
}
