import { readFile, writeFile } from 'fs/promises';
import path from 'path';
import type { GiuseppeBrain, WorkingMemory } from '../types';

const MEMORY_DIR = path.join(process.cwd(), 'memory');
const BRAIN_PATH = path.join(MEMORY_DIR, 'giuseppe_brain.json');
const WORKING_MEMORY_PATH = path.join(MEMORY_DIR, 'working_memory.json');

const EMPTY_WORKING_MEMORY: WorkingMemory = {
  sessions: [],
  notes: []
};

export async function loadBrain(): Promise<GiuseppeBrain> {
  const raw = await readFile(BRAIN_PATH, 'utf8');
  return JSON.parse(raw) as GiuseppeBrain;
}

export async function loadWorkingMemory(): Promise<WorkingMemory> {
  try {
    const raw = await readFile(WORKING_MEMORY_PATH, 'utf8');
    return JSON.parse(raw) as WorkingMemory;
  } catch {
    return { ...EMPTY_WORKING_MEMORY };
  }
}

export async function saveWorkingMemory(memory: WorkingMemory): Promise<void> {
  await writeFile(WORKING_MEMORY_PATH, `${JSON.stringify(memory, null, 2)}\n`, 'utf8');
}
