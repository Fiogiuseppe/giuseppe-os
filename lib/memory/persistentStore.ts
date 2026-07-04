import type { GiuseppeBrain, LongTermMemory, WorkingMemory } from '../brain/types';
import { loadBrainConstitution } from './brainConstitution';
import {
  loadLongTermMemoryFromMemory,
  loadWorkingMemoryFromMemory,
  saveLongTermMemoryToMemory,
  saveWorkingMemoryToMemory
} from './inMemoryStore';
import { isSupabaseConfigured } from './supabase/client';
import {
  loadLongTermMemoryFromSupabase,
  loadWorkingMemoryFromSupabase,
  saveLongTermMemoryToSupabase,
  saveWorkingMemoryToSupabase
} from './supabase/store';

export type MemoryBackend = 'supabase' | 'memory';

export function resolveMemoryBackend(): MemoryBackend {
  if (isSupabaseConfigured()) {
    return 'supabase';
  }
  return 'memory';
}

export async function loadBrain(): Promise<GiuseppeBrain> {
  return loadBrainConstitution();
}

export async function loadWorkingMemory(): Promise<WorkingMemory> {
  if (resolveMemoryBackend() === 'supabase') {
    return loadWorkingMemoryFromSupabase();
  }
  return loadWorkingMemoryFromMemory();
}

export async function saveWorkingMemory(memory: WorkingMemory): Promise<void> {
  if (resolveMemoryBackend() === 'supabase') {
    await saveWorkingMemoryToSupabase(memory);
    return;
  }
  saveWorkingMemoryToMemory(memory);
}

export async function loadLongTermMemory(): Promise<LongTermMemory> {
  if (resolveMemoryBackend() === 'supabase') {
    return loadLongTermMemoryFromSupabase();
  }
  return loadLongTermMemoryFromMemory();
}

export async function saveLongTermMemory(memory: LongTermMemory): Promise<void> {
  if (resolveMemoryBackend() === 'supabase') {
    await saveLongTermMemoryToSupabase(memory);
    return;
  }
  saveLongTermMemoryToMemory(memory);
}
