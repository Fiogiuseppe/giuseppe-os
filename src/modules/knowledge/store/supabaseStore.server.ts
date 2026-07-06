import { getSupabaseClient } from '../../../../lib/memory/supabase/client';
import type { KnowledgeItem, KnowledgeOwner, KnowledgeStatus, KnowledgeType } from '../models/knowledge.types';
import { buildKnowledgeDedupKey, buildKnowledgeId } from './types';
import type { KnowledgeStore, UpsertKnowledgeInput } from './types';
import type { SourceProviderId } from '../../sources/providers/source-provider.types';

type DbKnowledgeItem = {
  id: string;
  owner: string;
  source_id: string;
  source_type: string;
  knowledge_type: string;
  label: string;
  summary: string;
  confidence: number;
  evidence_ids: string[];
  evidence_urls: string[];
  metadata: Record<string, unknown>;
  status: string;
  dedup_key: string;
  created_at: string;
  updated_at: string;
};

function parseRow(row: DbKnowledgeItem): KnowledgeItem {
  return {
    id: row.id,
    owner: row.owner as KnowledgeOwner,
    sourceId: row.source_id as SourceProviderId,
    sourceType: row.source_type,
    knowledgeType: row.knowledge_type as KnowledgeType,
    label: row.label,
    summary: row.summary,
    confidence: row.confidence,
    evidenceIds: row.evidence_ids ?? [],
    evidenceUrls: row.evidence_urls ?? [],
    metadata: row.metadata ?? {},
    status: row.status as KnowledgeStatus,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export const supabaseKnowledgeStore: KnowledgeStore = {
  backend: 'supabase',

  async findByDedupKey(dedupKey) {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('knowledge_items')
      .select('*')
      .eq('dedup_key', dedupKey)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    return data ? parseRow(data as DbKnowledgeItem) : null;
  },

  async listByOwner(owner) {
    const client = getSupabaseClient();
    const { data, error } = await client.from('knowledge_items').select('*').eq('owner', owner);

    if (error) {
      throw new Error(error.message);
    }

    return (data ?? []).map(row => parseRow(row as DbKnowledgeItem));
  },

  async listBySource(owner, sourceId) {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('knowledge_items')
      .select('*')
      .eq('owner', owner)
      .eq('source_id', sourceId);

    if (error) {
      throw new Error(error.message);
    }

    return (data ?? []).map(row => parseRow(row as DbKnowledgeItem));
  },

  async upsert(input: UpsertKnowledgeInput) {
    const client = getSupabaseClient();
    const dedupKey = buildKnowledgeDedupKey(input.owner, input.knowledgeType, input.label);
    const id = input.id ?? buildKnowledgeId(dedupKey);
    const now = new Date().toISOString();
    const payload = {
      id,
      owner: input.owner,
      source_id: input.sourceId,
      source_type: input.sourceType,
      knowledge_type: input.knowledgeType,
      label: input.label,
      summary: input.summary,
      confidence: input.confidence,
      evidence_ids: input.evidenceIds,
      evidence_urls: input.evidenceUrls,
      metadata: input.metadata,
      status: input.status,
      dedup_key: dedupKey,
      created_at: input.createdAt ?? now,
      updated_at: now
    };

    const { data, error } = await client
      .from('knowledge_items')
      .upsert(payload, { onConflict: 'dedup_key' })
      .select('*')
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return parseRow(data as DbKnowledgeItem);
  },

  async resetForTests() {
    const client = getSupabaseClient();
    await client.from('knowledge_items').delete().neq('id', '');
  }
};
