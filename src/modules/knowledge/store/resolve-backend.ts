import { isSupabaseConfigured } from '../../../../lib/memory/supabase/client';
import type { KnowledgeStoreBackend } from './types';

export function resolveKnowledgeStoreBackend(): KnowledgeStoreBackend {
  if (process.env.KNOWLEDGE_STORE === 'memory' || process.env.SOURCES_ENGINE_STORE === 'memory') {
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
