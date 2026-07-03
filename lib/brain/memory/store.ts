import { readFile, writeFile } from 'fs/promises';
import path from 'path';
import type { GiuseppeBrain, LongTermMemory, WorkingMemory } from '../types';

const MEMORY_DIR = path.join(process.cwd(), 'memory');
const BRAIN_PATH = path.join(MEMORY_DIR, 'giuseppe_brain.json');
const WORKING_MEMORY_PATH = process.env.BRAIN_WORKING_MEMORY_PATH
  ? path.resolve(process.env.BRAIN_WORKING_MEMORY_PATH)
  : path.join(MEMORY_DIR, 'working_memory.json');
const LONG_TERM_PATH = process.env.BRAIN_LONG_TERM_PATH
  ? path.resolve(process.env.BRAIN_LONG_TERM_PATH)
  : path.join(MEMORY_DIR, 'long_term.json');

const EMPTY_WORKING_MEMORY: WorkingMemory = {
  sessions: [],
  notes: [],
  records: []
};

const EMPTY_LONG_TERM: LongTermMemory = {
  decisions: [],
  lessons: [],
  patterns_detected: []
};

export async function loadBrain(): Promise<GiuseppeBrain> {
  const raw = await readFile(BRAIN_PATH, 'utf8');
  return JSON.parse(raw) as GiuseppeBrain;
}

export async function loadWorkingMemory(): Promise<WorkingMemory> {
  try {
    const raw = await readFile(WORKING_MEMORY_PATH, 'utf8');
    const parsed = JSON.parse(raw) as WorkingMemory;
    return {
      sessions: parsed.sessions ?? [],
      notes: parsed.notes ?? [],
      records: parsed.records ?? []
    };
  } catch {
    return { ...EMPTY_WORKING_MEMORY };
  }
}

export async function saveWorkingMemory(memory: WorkingMemory): Promise<void> {
  await writeFile(WORKING_MEMORY_PATH, `${JSON.stringify(memory, null, 2)}\n`, 'utf8');
}

export async function loadLongTermMemory(): Promise<LongTermMemory> {
  try {
    const raw = await readFile(LONG_TERM_PATH, 'utf8');
    return JSON.parse(raw) as LongTermMemory;
  } catch {
    return { ...EMPTY_LONG_TERM };
  }
}

export async function saveLongTermMemory(memory: LongTermMemory): Promise<void> {
  await writeFile(LONG_TERM_PATH, `${JSON.stringify(memory, null, 2)}\n`, 'utf8');
}
