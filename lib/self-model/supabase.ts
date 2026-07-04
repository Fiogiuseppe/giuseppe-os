import { getSupabaseClient } from '../memory/supabase/client';
import { createEmptySelfModel } from './dimensions';
import { SELF_MODEL_ID } from './constants';
import type { SelfModel, SelfModelDimensionKey, SelfModelPattern } from './types';
import { SELF_MODEL_DIMENSION_KEYS } from './types';

type DbSelfModel = {
  id: string;
  version: string;
  dimensions: Record<string, unknown>;
  patterns: unknown;
  updated_at: string;
};

function parseDimension(raw: unknown): SelfModel['dimensions'][SelfModelDimensionKey] {
  const row = (raw ?? {}) as Record<string, unknown>;
  return {
    current_estimate: typeof row.current_estimate === 'string' ? row.current_estimate : 'unknown',
    confidence:
      row.confidence === 'high' || row.confidence === 'medium' || row.confidence === 'low'
        ? row.confidence
        : 'low',
    evidence_count: typeof row.evidence_count === 'number' ? row.evidence_count : 0,
    last_updated: typeof row.last_updated === 'string' ? row.last_updated : null,
    evidence_sources: Array.isArray(row.evidence_sources)
      ? row.evidence_sources.filter((item): item is string => typeof item === 'string')
      : [],
    notes: Array.isArray(row.notes) ? row.notes.filter((item): item is string => typeof item === 'string') : []
  };
}

function parsePatterns(raw: unknown): SelfModelPattern[] {
  if (!Array.isArray(raw)) {
    return [];
  }

  return raw
    .map(item => {
      const row = item as Record<string, unknown>;
      if (typeof row.pattern !== 'string' || typeof row.id !== 'string') {
        return null;
      }

      return {
        id: row.id,
        pattern: row.pattern,
        dimensions: Array.isArray(row.dimensions)
          ? row.dimensions.filter((key): key is SelfModelDimensionKey =>
              SELF_MODEL_DIMENSION_KEYS.includes(key as SelfModelDimensionKey)
            )
          : [],
        evidence_count: typeof row.evidence_count === 'number' ? row.evidence_count : 1,
        confidence:
          row.confidence === 'high' || row.confidence === 'medium' || row.confidence === 'low'
            ? row.confidence
            : 'low',
        last_updated: typeof row.last_updated === 'string' ? row.last_updated : new Date().toISOString(),
        source: typeof row.source === 'string' ? row.source : 'unknown'
      };
    })
    .filter((item): item is SelfModelPattern => item !== null);
}

export async function loadSelfModelFromSupabase(): Promise<SelfModel> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('memory_self_model')
    .select('*')
    .eq('id', SELF_MODEL_ID)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return createEmptySelfModel();
  }

  const row = data as DbSelfModel;
  const empty = createEmptySelfModel(row.updated_at);

  for (const key of SELF_MODEL_DIMENSION_KEYS) {
    empty.dimensions[key] = parseDimension((row.dimensions as Record<string, unknown> | null)?.[key]);
  }

  return {
    ...empty,
    version: row.version,
    patterns: parsePatterns(row.patterns)
  };
}

export async function saveSelfModelToSupabase(model: SelfModel): Promise<void> {
  const supabase = getSupabaseClient();

  await supabase.from('memory_self_model').upsert(
    {
      id: model.id,
      version: model.version,
      dimensions: model.dimensions,
      patterns: model.patterns,
      updated_at: model.updatedAt
    },
    { onConflict: 'id' }
  );
}
