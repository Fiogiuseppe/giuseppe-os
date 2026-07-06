import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { KnowledgeItem, KnowledgeOwner } from '../models/knowledge.types';
import { buildKnowledgeDedupKey, buildKnowledgeId } from './types';
import type { KnowledgeStore, UpsertKnowledgeInput } from './types';

type FileSnapshot = {
  items: KnowledgeItem[];
  dedupIndex: Record<string, string>;
};

const DATA_DIR = path.join(process.cwd(), '.data', 'knowledge');
const STATE_FILE = path.join(DATA_DIR, 'state.json');

async function readSnapshot(): Promise<FileSnapshot> {
  try {
    const raw = await readFile(STATE_FILE, 'utf8');
    const parsed = JSON.parse(raw) as FileSnapshot;
    return {
      items: Array.isArray(parsed.items) ? parsed.items : [],
      dedupIndex: parsed.dedupIndex ?? {}
    };
  } catch {
    return { items: [], dedupIndex: {} };
  }
}

async function writeSnapshot(snapshot: FileSnapshot): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(STATE_FILE, JSON.stringify(snapshot, null, 2), 'utf8');
}

export const fileKnowledgeStore: KnowledgeStore = {
  backend: 'file',

  async findByDedupKey(dedupKey) {
    const snapshot = await readSnapshot();
    const id = snapshot.dedupIndex[dedupKey];
    return snapshot.items.find(item => item.id === id) ?? null;
  },

  async listByOwner(owner: KnowledgeOwner) {
    const snapshot = await readSnapshot();
    return snapshot.items.filter(item => item.owner === owner);
  },

  async listBySource(owner, sourceId) {
    const snapshot = await readSnapshot();
    return snapshot.items.filter(item => item.owner === owner && item.sourceId === sourceId);
  },

  async upsert(input: UpsertKnowledgeInput) {
    const snapshot = await readSnapshot();
    const dedupKey = buildKnowledgeDedupKey(input.owner, input.knowledgeType, input.label);
    const id = input.id ?? snapshot.dedupIndex[dedupKey] ?? buildKnowledgeId(dedupKey);
    const now = new Date().toISOString();
    const existing = snapshot.items.find(item => item.id === id);
    const record: KnowledgeItem = {
      ...input,
      id,
      createdAt: existing?.createdAt ?? input.createdAt ?? now,
      updatedAt: now
    };

    const index = snapshot.items.findIndex(item => item.id === id);
    if (index >= 0) {
      snapshot.items[index] = record;
    } else {
      snapshot.items.push(record);
    }
    snapshot.dedupIndex[dedupKey] = id;
    await writeSnapshot(snapshot);
    return record;
  },

  async resetForTests() {
    await writeSnapshot({ items: [], dedupIndex: {} });
  }
};
