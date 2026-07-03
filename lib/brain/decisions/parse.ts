import type { DecisionResult } from '../../../engine/decisionEngine';
import { COUNSELLOR_LABELS } from '../../../engine/decisionEngine';

export interface ParsedDecisionFields {
  recommendation?: string;
  whyItMatters?: string;
  hiddenNeed?: string;
  bias?: string;
  boardPerspective?: string;
  nextAction?: string;
  confidenceScore?: number;
  categoryLabel?: string;
  betterVersion?: string;
}

function stripCodeFence(text: string): string {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  return fenced?.[1]?.trim() ?? trimmed;
}

export function parseDecisionFieldsFromAnswer(answer: string): ParsedDecisionFields {
  const cleaned = stripCodeFence(answer);

  try {
    const parsed = JSON.parse(cleaned) as ParsedDecisionFields;
    if (parsed && typeof parsed === 'object') {
      return parsed;
    }
  } catch {
    // Fall through to regex parsing for rule-based prose.
  }

  const fields: ParsedDecisionFields = {};
  const pick = (pattern: RegExp) => answer.match(pattern)?.[1]?.trim();

  fields.categoryLabel = pick(/categoria:\s*(.+)/i);
  fields.recommendation = pick(/raccomandazione:\s*(.+)/i) ?? pick(/recommendation:\s*(.+)/i);
  fields.whyItMatters = pick(/perch[eé]\s+conta:\s*(.+)/i) ?? pick(/why it matters:\s*(.+)/i);
  fields.hiddenNeed = pick(/bisogno nascosto:\s*(.+)/i) ?? pick(/hidden need:\s*(.+)/i);
  fields.bias = pick(/bias possibile:\s*(.+)/i) ?? pick(/possible bias:\s*(.+)/i) ?? pick(/bias:\s*(.+)/i);
  fields.nextAction = pick(/prossimo passo:\s*(.+)/i) ?? pick(/next action:\s*(.+)/i);
  fields.betterVersion = pick(/versione migliore:\s*(.+)/i) ?? pick(/better version:\s*(.+)/i);
  fields.confidenceScore = Number(pick(/confidence(?:\s+score)?:\s*(\d+)/i));

  const boardLines = answer
    .split('\n')
    .map(line => line.trim())
    .filter(line =>
      Object.values(COUNSELLOR_LABELS).some(label => line.toLowerCase().startsWith(`${label.toLowerCase()}:`))
    );

  if (boardLines.length) {
    fields.boardPerspective = boardLines.join('\n');
  }

  return fields;
}

export function summarizeBoard(engine: DecisionResult): string {
  return Object.entries(engine.counsellors)
    .map(([key, text]) => `${COUNSELLOR_LABELS[key as keyof typeof engine.counsellors]}: ${text}`)
    .join('\n');
}
