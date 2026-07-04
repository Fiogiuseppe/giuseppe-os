import type {
  BrainRequest,
  ContextPacket,
  MemoryRecord,
  MemoryRecordType,
  MemoryUpdateResult,
  WorkingMemory
} from '../types';
import type { EvidenceAssessment } from '../../memory/evidence';
import { confidenceFromEvidence } from '../../memory/evidence';
import { loadLongTermMemory, loadWorkingMemory, saveLongTermMemory, saveWorkingMemory } from './store';

const MAX_SESSIONS = 40;
const MAX_RECORDS = 80;

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

function shouldRemember(request: BrainRequest, answer: string, context: ContextPacket): {
  remember: boolean;
  type?: MemoryRecordType;
} {
  if (context.lowContext || answer.trim().length < 24) {
    return { remember: false };
  }

  if (request.intent === 'decide') {
    return { remember: true, type: 'decision' };
  }

  if (request.intent === 'learn') {
    return { remember: true, type: 'lesson' };
  }

  if (request.intent === 'awareness' && /notic|pattern|rischio|contrad/i.test(answer)) {
    return { remember: true, type: 'pattern' };
  }

  if (request.intent === 'reflect' && answer.length > 80) {
    return { remember: true, type: 'timeline' };
  }

  if (request.intent === 'query' && /lesson|pattern|decision/i.test(answer)) {
    return { remember: true, type: 'lesson' };
  }

  return { remember: false };
}

export function extractResponseNextAction(answer: string): string | undefined {
  return extractNextAction(answer);
}

export async function applyMemoryUpdate(params: {
  request: BrainRequest;
  context: ContextPacket;
  answer: string;
  workingMemory: WorkingMemory;
  persist?: boolean;
}): Promise<MemoryUpdateResult> {
  const { request, context, answer, workingMemory, persist = true } = params;

  if (!persist) {
    return {
      updated: false,
      discarded: false,
      recordsAdded: []
    };
  }

  const decision = shouldRemember(request, answer, context);

  if (!decision.remember) {
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
      discarded: true,
      sessionId,
      recordsAdded: []
    };
  }

  const summary = summarize(answer);
  const sessionId = `session_${Date.now()}`;
  const record: MemoryRecord = {
    id: `record_${Date.now()}`,
    type: decision.type ?? 'timeline',
    content: summary,
    createdAt: new Date().toISOString(),
    confidence: context.lowContext ? 0.4 : 0.75,
    source: 'interaction'
  };

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
    ].slice(-MAX_SESSIONS),
    records: [...(workingMemory.records ?? []), record].slice(-MAX_RECORDS)
  };

  await saveWorkingMemory(nextMemory);

  if (request.intent === 'decide' && request.decision) {
    const longTerm = await loadLongTermMemory();
    await saveLongTermMemory({
      ...longTerm,
      decisions: [
        ...longTerm.decisions,
        {
          id: `decision_${Date.now()}`,
          decision: request.decision,
          reason: request.reason ?? '',
          timestamp: new Date().toISOString()
        }
      ].slice(-50)
    });
  }

  if (decision.type === 'lesson') {
    const longTerm = await loadLongTermMemory();
    await saveLongTermMemory({
      ...longTerm,
      lessons: [
        ...longTerm.lessons,
        {
          id: `lesson_${Date.now()}`,
          lesson: summary,
          source: request.intent,
          timestamp: new Date().toISOString()
        }
      ].slice(-50)
    });
  }

  return {
    updated: true,
    discarded: false,
    sessionId,
    recordsAdded: [record]
  };
}

export function estimateConfidence(context: ContextPacket, assessment?: EvidenceAssessment): number {
  if (assessment) {
    const gated = confidenceFromEvidence(assessment, context.intent === 'decide' ? 3 : 2);
    if (gated.value !== null) {
      return gated.value / 100;
    }
    return assessment.level === 'learning' ? 0.35 : 0.25;
  }

  if (context.lowContext) {
    return 0.45;
  }

  if (context.intent === 'decide') {
    return 0.78;
  }

  if (context.intent === 'awareness' || context.intent === 'reflect') {
    return 0.72;
  }

  if (context.intent === 'learn') {
    return 0.74;
  }

  return 0.7;
}

export async function getWorkingMemory(): Promise<WorkingMemory> {
  return loadWorkingMemory();
}
