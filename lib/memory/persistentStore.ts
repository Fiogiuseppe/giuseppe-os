import type { GiuseppeBrain, LongTermMemory, WorkingMemory } from '../brain/types';
import {
  loadBrainFromJson,
  loadLongTermMemoryFromJson,
  loadWorkingMemoryFromJson,
  saveLongTermMemoryToJson,
  saveWorkingMemoryToJson
} from './jsonStore';
import { isSupabaseConfigured } from './supabase/client';
import {
  loadLongTermMemoryFromSupabase,
  loadWorkingMemoryFromSupabase,
  saveLongTermMemoryToSupabase,
  saveWorkingMemoryToSupabase
} from './supabase/store';

export type MemoryBackend = 'json' | 'supabase';

export function resolveMemoryBackend(): MemoryBackend {
  if (process.env.MEMORY_BACKEND === 'supabase' && isSupabaseConfigured()) {
    return 'supabase';
  }
  return 'json';
}

export async function loadBrain(): Promise<GiuseppeBrain> {
  return loadBrainFromJson();
}

export async function loadWorkingMemory(): Promise<WorkingMemory> {
  if (resolveMemoryBackend() === 'supabase') {
    return loadWorkingMemoryFromSupabase();
  }
  return loadWorkingMemoryFromJson();
}

export async function saveWorkingMemory(memory: WorkingMemory): Promise<void> {
  await saveWorkingMemoryToJson(memory);
  if (resolveMemoryBackend() === 'supabase') {
    await saveWorkingMemoryToSupabase(memory);
  }
}

export async function loadLongTermMemory(): Promise<LongTermMemory> {
  if (resolveMemoryBackend() === 'supabase') {
    return loadLongTermMemoryFromSupabase();
  }
  return loadLongTermMemoryFromJson();
}

export async function saveLongTermMemory(memory: LongTermMemory): Promise<void> {
  await saveLongTermMemoryToJson(memory);
  if (resolveMemoryBackend() === 'supabase') {
    await saveLongTermMemoryToSupabase(memory);
  }
}
