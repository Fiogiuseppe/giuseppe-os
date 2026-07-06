import type { SafeKnowledgeItem } from '../../knowledge/models/knowledge.types';
import type { IntelligenceKnowledgeQuery } from '../../intelligence/read/intelligence-read.types';
import {
  BRAIN_UNKNOWN_ANSWER,
  type BrainEvidenceRef,
  type DerivedKnowledgeQuery
} from './brain-answer.types';

function normalizeQuestion(question: string): string {
  return question.trim().toLowerCase();
}

/** Map natural-language cues to Intelligence Read queries — deterministic, no LLM. */
export function deriveKnowledgeQueryFromQuestion(question: string): DerivedKnowledgeQuery {
  const normalized = normalizeQuestion(question);

  if (normalized.includes('urees')) {
    return { query: { q: 'urees' }, reason: 'question mentions UREES' };
  }

  if (normalized.includes('medium') || normalized.includes('article')) {
    return { query: { sourceId: 'medium_personal' }, reason: 'question asks about Medium' };
  }

  if (normalized.includes('decision intelligence')) {
    return { query: { q: 'decision intelligence' }, reason: 'question mentions Decision Intelligence' };
  }

  if (normalized.includes('visceral')) {
    return { query: { q: 'visceral' }, reason: 'question mentions Visceral' };
  }

  if (/\bprojects?\b/.test(normalized)) {
    return { query: { knowledgeType: 'project' }, reason: 'question asks about projects' };
  }

  if (/\btopics?\b/.test(normalized) || /\bthemes?\b/.test(normalized)) {
    return { query: { knowledgeType: 'topic' }, reason: 'question asks about topics or themes' };
  }

  return { query: { owner: 'giuseppe' }, reason: 'general knowledge overview' };
}

export function toBrainEvidenceRef(item: SafeKnowledgeItem): BrainEvidenceRef {
  return {
    id: item.id,
    label: item.label,
    knowledgeType: item.knowledgeType,
    summary: item.summary,
    sourceId: item.sourceId,
    evidenceUrls: [...item.evidenceUrls],
    confidence: item.confidence
  };
}

function formatEvidenceUrls(urls: string[]): string {
  if (urls.length === 0) {
    return '';
  }
  if (urls.length === 1) {
    return ` Evidence: ${urls[0]}`;
  }
  return ` Evidence: ${urls.join(', ')}`;
}

function formatSingleItemAnswer(item: SafeKnowledgeItem): string {
  const urls = formatEvidenceUrls(item.evidenceUrls);
  return `Based on synchronized knowledge, ${item.label} (${item.knowledgeType}): ${item.summary}.${urls}`;
}

function formatProjectListAnswer(items: SafeKnowledgeItem[]): string {
  const lines = items.map(item => {
    const urls = item.evidenceUrls.length > 0 ? ` (${item.evidenceUrls[0]})` : '';
    return `- ${item.label}: ${item.summary}${urls}`;
  });
  return `Based on synchronized knowledge, Giuseppe has ${items.length} project${items.length === 1 ? '' : 's'}:\n${lines.join('\n')}`;
}

function formatOverviewAnswer(items: SafeKnowledgeItem[]): string {
  const labels = items.map(item => item.label).join(', ');
  return `Based on synchronized knowledge, Giuseppe OS currently holds ${items.length} knowledge item${items.length === 1 ? '' : 's'} from synchronized sources: ${labels}.`;
}

export function generateEvidenceAnswer(input: {
  question: string;
  query: IntelligenceKnowledgeQuery;
  items: SafeKnowledgeItem[];
}): { answer: string; confidence: number } {
  if (input.items.length === 0) {
    return { answer: BRAIN_UNKNOWN_ANSWER, confidence: 0 };
  }

  const evidence = input.items.map(toBrainEvidenceRef);
  const averageConfidence =
    evidence.reduce((sum, row) => sum + row.confidence, 0) / evidence.length;

  const normalized = normalizeQuestion(input.question);

  if (input.query.knowledgeType === 'project' || /\bprojects?\b/.test(normalized)) {
    return {
      answer: formatProjectListAnswer(input.items),
      confidence: Number(averageConfidence.toFixed(2))
    };
  }

  if (input.items.length === 1) {
    return {
      answer: formatSingleItemAnswer(input.items[0]),
      confidence: input.items[0].confidence
    };
  }

  if (!input.query.q && !input.query.knowledgeType && input.query.owner) {
    return {
      answer: formatOverviewAnswer(input.items),
      confidence: Number(averageConfidence.toFixed(2))
    };
  }

  const lines = input.items.map(item => formatSingleItemAnswer(item));
  return {
    answer: lines.join('\n\n'),
    confidence: Number(averageConfidence.toFixed(2))
  };
}
