import type { LongTermMemory, WorkingMemory } from '../brain/types';

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

let workingMemory: WorkingMemory = { ...EMPTY_WORKING_MEMORY, sessions: [], notes: [], records: [] };
let longTermMemory: LongTermMemory = {
  ...EMPTY_LONG_TERM,
  decisions: [],
  lessons: [],
  patterns_detected: [],
  insight_history: []
};

export function loadWorkingMemoryFromMemory(): WorkingMemory {
  return {
    sessions: [...workingMemory.sessions],
    notes: [...workingMemory.notes],
    records: [...(workingMemory.records ?? [])]
  };
}

export function saveWorkingMemoryToMemory(memory: WorkingMemory): void {
  workingMemory = {
    sessions: [...memory.sessions],
    notes: [...memory.notes],
    records: [...(memory.records ?? [])]
  };
}

export function loadLongTermMemoryFromMemory(): LongTermMemory {
  return {
    decisions: [...longTermMemory.decisions],
    lessons: [...longTermMemory.lessons],
    patterns_detected: [...longTermMemory.patterns_detected],
    insight_history: [...(longTermMemory.insight_history ?? [])]
  };
}

export function saveLongTermMemoryToMemory(memory: LongTermMemory): void {
  longTermMemory = {
    decisions: [...memory.decisions],
    lessons: [...memory.lessons],
    patterns_detected: [...memory.patterns_detected],
    insight_history: [...(memory.insight_history ?? [])]
  };
}

export function resetInMemoryStoreForTests(): void {
  workingMemory = { ...EMPTY_WORKING_MEMORY, sessions: [], notes: [], records: [] };
  longTermMemory = {
    ...EMPTY_LONG_TERM,
    decisions: [],
    lessons: [],
    patterns_detected: [],
    insight_history: []
  };
}
