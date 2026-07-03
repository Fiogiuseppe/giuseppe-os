import type { BrainRequest, ContextPacket, MemoryUpdateResult, WorkingMemory } from '../types';
import { loadWorkingMemory, saveWorkingMemory } from '../memory/store';

const MAX_SESSIONS = 40;

function summarize(answer: string): string {
  const line = answer.split('\n').find(item => item.trim().length > 0)?.trim() ?? answer.trim();
  return line.slice(0, 220);
}

function extractNextAction(answer: string): string | undefined {
  const patterns = [
    /prossimo passo:\s*(.+)/i,
    /next action:\s*(.+)/i,
    /azione consigliata:\s*(.+)/i
  ];

  for (const pattern of patterns) {
    const match = answer.match(pattern);
    if (match?.[1]) {
      return match[1].trim();
    }
  }

  return undefined;
}

export function extractResponseNextAction(answer: string): string | undefined {
  return extractNextAction(answer);
}

export async function applyMemoryUpdate(params: {
  request: BrainRequest;
  context: ContextPacket;
  answer: string;
  workingMemory: WorkingMemory;
}): Promise<MemoryUpdateResult> {
  const { request, answer, workingMemory } = params;
  const summary = summarize(answer);
  const sessionId = `session_${Date.now()}`;

  const nextMemory: WorkingMemory = {
    ...workingMemory,
    sessions: [
      ...workingMemory.sessions,
      {
        id: sessionId,
        timestamp: new Date().toISOString(),
        intent: request.intent,
        summary,
        query: request.message || request.decision || ''
      }
    ].slice(-MAX_SESSIONS)
  };

  await saveWorkingMemory(nextMemory);

  return {
    updated: true,
    sessionId
  };
}

export function estimateConfidence(context: ContextPacket): number {
  if (context.lowContext) {
    return 0.45;
  }

  if (context.intent === 'decide') {
    return 0.78;
  }

  if (context.intent === 'reflect') {
    return 0.72;
  }

  return 0.7;
}

export async function getWorkingMemory(): Promise<WorkingMemory> {
  return loadWorkingMemory();
}
