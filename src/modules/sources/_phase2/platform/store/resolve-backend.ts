import { isSupabaseConfigured } from '../../../../../lib/memory/supabase/client';
import type { SourceEngineStoreBackend } from './types';

export function resolveSourceEngineStoreBackend(): SourceEngineStoreBackend {
  if (process.env.SOURCES_ENGINE_STORE === 'memory') {
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
