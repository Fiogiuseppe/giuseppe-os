import type { LongTermMemory, MemoryRecord, WorkingMemory, WorkingMemorySession } from '../../brain/types';
import { getSupabaseClient } from './client';

type DbSession = {
  id: string;
  intent: string;
  summary: string;
  query: string | null;
  created_at: string;
};

type DbRecord = {
  id: string;
  type: string;
  content: string;
  confidence: number;
  source: string;
  session_id: string | null;
  created_at: string;
};

type DbDecision = {
  id: string;
  decision: string;
  reason: string | null;
  category: string | null;
  created_at: string;
};

type DbLesson = {
  id: string;
  lesson: string;
  source: string;
  created_at: string;
};

type DbInsight = {
  id: string;
  insight_id: string;
  insight: string;
  signal_type: string;
  evidence_score: number;
  created_at: string;
};

export async function loadWorkingMemoryFromSupabase(): Promise<WorkingMemory> {
  const supabase = getSupabaseClient();

  const [{ data: sessions }, { data: records }] = await Promise.all([
    supabase.from('memory_sessions').select('*').order('created_at', { ascending: true }),
    supabase.from('memory_records').select('*').order('created_at', { ascending: true })
  ]);

  return {
    sessions: (sessions ?? []).map((row: DbSession) => ({
      id: row.id,
      timestamp: row.created_at,
      intent: row.intent as WorkingMemorySession['intent'],
      summary: row.summary,
      query: row.query ?? ''
    })),
    notes: [],
    records: (records ?? []).map((row: DbRecord) => ({
      id: row.id,
      type: row.type as MemoryRecord['type'],
      content: row.content,
      createdAt: row.created_at,
      confidence: row.confidence,
      source: row.source as MemoryRecord['source']
    }))
  };
}

export async function saveWorkingMemoryToSupabase(memory: WorkingMemory): Promise<void> {
  const supabase = getSupabaseClient();

  const sessionRows = memory.sessions.map(session => ({
    id: session.id,
    intent: session.intent,
    summary: session.summary,
    query: session.query,
    created_at: session.timestamp
  }));

  const recordRows = (memory.records ?? []).map(record => ({
    id: record.id,
    type: record.type,
    content: record.content,
    confidence: record.confidence,
    source: record.source,
    session_id: null,
    created_at: record.createdAt
  }));

  await supabase.from('memory_sessions').upsert(sessionRows, { onConflict: 'id' });
  if (recordRows.length > 0) {
    await supabase.from('memory_records').upsert(recordRows, { onConflict: 'id' });
  }
}

export async function loadLongTermMemoryFromSupabase(): Promise<LongTermMemory> {
  const supabase = getSupabaseClient();

  const [{ data: decisions }, { data: lessons }, { data: patterns }, { data: insights }] =
    await Promise.all([
      supabase.from('memory_decisions').select('*').order('created_at', { ascending: true }),
      supabase.from('memory_lessons').select('*').order('created_at', { ascending: true }),
      supabase.from('memory_patterns').select('pattern').order('created_at', { ascending: true }),
      supabase.from('memory_insights').select('*').order('created_at', { ascending: true })
    ]);

  return {
    decisions: (decisions ?? []).map((row: DbDecision) => ({
      id: row.id,
      decision: row.decision,
      reason: row.reason ?? '',
      category: row.category ?? undefined,
      timestamp: row.created_at
    })),
    lessons: (lessons ?? []).map((row: DbLesson) => ({
      id: row.id,
      lesson: row.lesson,
      source: row.source,
      timestamp: row.created_at
    })),
    patterns_detected: (patterns ?? []).map((row: { pattern: string }) => row.pattern),
    insight_history: (insights ?? []).map((row: DbInsight) => ({
      id: row.id,
      insightId: row.insight_id,
      insight: row.insight,
      signalType: row.signal_type,
      evidenceScore: row.evidence_score,
      timestamp: row.created_at
    }))
  };
}

export async function saveLongTermMemoryToSupabase(memory: LongTermMemory): Promise<void> {
  const supabase = getSupabaseClient();

  const decisionRows = memory.decisions.map(row => ({
    id: row.id,
    decision: row.decision,
    reason: row.reason,
    category: row.category ?? null,
    created_at: row.timestamp
  }));

  const lessonRows = memory.lessons.map(row => ({
    id: row.id,
    lesson: row.lesson,
    source: row.source,
    created_at: row.timestamp
  }));

  const patternRows = memory.patterns_detected.map((pattern, index) => ({
    id: `pattern_${index}_${pattern.slice(0, 24).replace(/\W/g, '_')}`,
    pattern,
    created_at: new Date().toISOString()
  }));

  const insightRows = (memory.insight_history ?? []).map(row => ({
    id: row.id,
    insight_id: row.insightId,
    insight: row.insight,
    signal_type: row.signalType,
    evidence_score: row.evidenceScore,
    created_at: row.timestamp
  }));

  if (decisionRows.length > 0) {
    await supabase.from('memory_decisions').upsert(decisionRows, { onConflict: 'id' });
  }
  if (lessonRows.length > 0) {
    await supabase.from('memory_lessons').upsert(lessonRows, { onConflict: 'id' });
  }
  if (patternRows.length > 0) {
    await supabase.from('memory_patterns').upsert(patternRows, { onConflict: 'id' });
  }
  if (insightRows.length > 0) {
    await supabase.from('memory_insights').upsert(insightRows, { onConflict: 'id' });
  }
}
