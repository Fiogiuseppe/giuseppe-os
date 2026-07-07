import { listPersistedKnowledge } from '../../src/modules/knowledge/services/knowledge-persistence.server';
import type { KnowledgeItem, KnowledgeType } from '../../src/modules/knowledge/models/knowledge.types';

const STRUCTURED_TYPES: KnowledgeType[] = ['brand', 'project', 'topic', 'value', 'goal', 'theme'];
const MAX_STATEMENTS = 18;
const SUMMARY_CHARS = 220;

function trimSummary(text: string): string {
  const normalized = text.replace(/\s+/g, ' ').trim();
  if (normalized.length <= SUMMARY_CHARS) {
    return normalized;
  }
  return `${normalized.slice(0, SUMMARY_CHARS - 1)}…`;
}

function formatStructured(items: KnowledgeItem[]): string[] {
  return items.map(item => {
    const summary = trimSummary(item.summary || item.label);
    return `- [${item.knowledgeType}] ${item.label} (${item.sourceId}, conf ${Math.round(item.confidence * 100)}%): ${summary}`;
  });
}

function formatStatements(items: KnowledgeItem[]): string[] {
  return items
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, MAX_STATEMENTS)
    .map(item => {
      const summary = trimSummary(item.summary || item.label);
      return `- ${item.label.slice(0, 120)} (${item.sourceId}): ${summary}`;
    });
}

export async function buildKnowledgeContextBlock(): Promise<string> {
  const items = await listPersistedKnowledge('giuseppe');
  const active = items.filter(item => item.status === 'active');

  if (active.length === 0) {
    return [
      'EVIDENCE FROM KNOWLEDGE (structured facts only — no invention)',
      'No persisted knowledge items yet.',
      'Do not invent biographical facts. Rely on identity context and ask Giuseppe to clarify.'
    ].join('\n');
  }

  const structured = active.filter(item => STRUCTURED_TYPES.includes(item.knowledgeType));
  const statements = active.filter(item => item.knowledgeType === 'statement');

  const lines = [
    'EVIDENCE FROM KNOWLEDGE (structured facts only — no invention)',
    `Total active items: ${active.length}`,
    '',
    'Structured identity signals:',
    ...(structured.length ? formatStructured(structured) : ['- (none yet)']),
    '',
    'Recent public statements (social, feeds):',
    ...(statements.length ? formatStatements(statements) : ['- (none yet)'])
  ];

  return lines.join('\n');
}
