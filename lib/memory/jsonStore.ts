import { readFile, writeFile } from 'fs/promises';
import path from 'path';
import type { GiuseppeBrain, LongTermMemory, WorkingMemory } from '../brain/types';

const MEMORY_DIR = path.join(process.cwd(), 'memory');
const BRAIN_PATH = path.join(MEMORY_DIR, 'giuseppe_brain.json');

export const JSON_PATHS = {
  working: process.env.BRAIN_WORKING_MEMORY_PATH
    ? path.resolve(process.env.BRAIN_WORKING_MEMORY_PATH)
    : path.join(MEMORY_DIR, 'working_memory.json'),
  longTerm: process.env.BRAIN_LONG_TERM_PATH
    ? path.resolve(process.env.BRAIN_LONG_TERM_PATH)
    : path.join(MEMORY_DIR, 'long_term.json')
};

const EMPTY_WORKING_MEMORY: WorkingMemory = {
  sessions: [],
  notes: [],
  records: []
};

const EMPTY_LONG_TERM: LongTermMemory = {
  decisions: [],
  lessons: [],
  patterns_detected: [],
  insight_history: []
};

export async function loadBrainFromJson(): Promise<GiuseppeBrain> {
  const raw = await readFile(BRAIN_PATH, 'utf8');
  return JSON.parse(raw) as GiuseppeBrain;
}

export async function loadWorkingMemoryFromJson(): Promise<WorkingMemory> {
  try {
    const raw = await readFile(JSON_PATHS.working, 'utf8');
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

export async function saveWorkingMemoryToJson(memory: WorkingMemory): Promise<void> {
  await writeFile(JSON_PATHS.working, `${JSON.stringify(memory, null, 2)}\n`, 'utf8');
}

export async function loadLongTermMemoryFromJson(): Promise<LongTermMemory> {
  try {
    const raw = await readFile(JSON_PATHS.longTerm, 'utf8');
    const parsed = JSON.parse(raw) as LongTermMemory;
    return {
      decisions: parsed.decisions ?? [],
      lessons: parsed.lessons ?? [],
      patterns_detected: parsed.patterns_detected ?? [],
      insight_history: parsed.insight_history ?? []
    };
  } catch {
    return { ...EMPTY_LONG_TERM };
  }
}

export async function saveLongTermMemoryToJson(memory: LongTermMemory): Promise<void> {
  await writeFile(JSON_PATHS.longTerm, `${JSON.stringify(memory, null, 2)}\n`, 'utf8');
}
