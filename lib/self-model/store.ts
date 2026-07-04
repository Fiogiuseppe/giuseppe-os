import { isSupabaseConfigured } from '../memory/supabase/client';
import { loadSelfModelFromMemory, saveSelfModelToMemory } from './inMemoryStore';
import { loadSelfModelFromSupabase, saveSelfModelToSupabase } from './supabase';
import type { SelfModel } from './types';

export type SelfModelBackend = 'supabase' | 'memory';

export function resolveSelfModelBackend(): SelfModelBackend {
  if (isSupabaseConfigured()) {
    return 'supabase';
  }
  return 'memory';
}

export async function loadSelfModel(): Promise<SelfModel> {
  if (resolveSelfModelBackend() === 'supabase') {
    return loadSelfModelFromSupabase();
  }
  return loadSelfModelFromMemory();
}

export async function saveSelfModel(model: SelfModel): Promise<void> {
  if (resolveSelfModelBackend() === 'supabase') {
    await saveSelfModelToSupabase(model);
    return;
  }
  saveSelfModelToMemory(model);
}
