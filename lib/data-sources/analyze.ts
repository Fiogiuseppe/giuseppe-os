import type { SelfModelDimensionKey } from '../self-model/types';
import type { DataSourceId, NormalizedSourceItem } from './types';

export type SourceAnalysis = {
  summary: string;
  dimensionHints: SelfModelDimensionKey[];
  confidence: 'low' | 'medium' | 'high';
  keywords: string[];
};

const KEYWORD_DIMENSIONS: Array<{ pattern: RegExp; dimensions: SelfModelDimensionKey[] }> = [
  { pattern: /design|creative|figma|art|brand|urees|upcycl/i, dimensions: ['creative_energy', 'reputation'] },
  { pattern: /lego|play|storytell/i, dimensions: ['creative_energy', 'alignment_with_future_self'] },
  { pattern: /health|sleep|workout|run|walk/i, dimensions: ['health'] },
  { pattern: /learn|book|read|course|study/i, dimensions: ['learning', 'curiosity'] },
  { pattern: /focus|deep work|calendar|meeting/i, dimensions: ['focus', 'execution'] },
  { pattern: /revenue|client|sale|shop|product/i, dimensions: ['financial_security', 'reputation'] },
  { pattern: /family|friend|relationship/i, dimensions: ['relationships', 'emotional_clarity'] },
  { pattern: /commit|ship|deploy|release|github/i, dimensions: ['execution', 'consistency'] },
  { pattern: /music|spotify|listen/i, dimensions: ['creative_energy', 'emotional_clarity'] }
];

const SOURCE_DEFAULT_DIMENSIONS: Partial<Record<DataSourceId, SelfModelDimensionKey[]>> = {
  instagram: ['creative_energy', 'reputation'],
  linkedin: ['reputation', 'execution'],
  calendar: ['focus', 'freedom'],
  gmail: ['execution', 'relationships'],
  github: ['execution', 'learning'],
  health: ['health'],
  books: ['learning', 'curiosity'],
  spotify: ['creative_energy', 'emotional_clarity'],
  figma: ['creative_energy', 'execution'],
  manual_import: ['alignment_with_future_self']
};

function uniqueDimensions(dimensions: SelfModelDimensionKey[]): SelfModelDimensionKey[] {
  return Array.from(new Set(dimensions));
}

function inferFromText(text: string): SelfModelDimensionKey[] {
  const matches: SelfModelDimensionKey[] = [];
  for (const rule of KEYWORD_DIMENSIONS) {
    if (rule.pattern.test(text)) {
      matches.push(...rule.dimensions);
    }
  }
  return uniqueDimensions(matches);
}

function buildSummary(item: NormalizedSourceItem): string {
  const text = [item.caption, item.content].filter(Boolean).join(' — ').trim();
  if (!text) {
    return `${item.source} activity (${item.kind}) on ${item.account}`;
  }

  return text.length > 220 ? `${text.slice(0, 217)}...` : text;
}

export function analyzeNormalizedItem(item: NormalizedSourceItem): SourceAnalysis {
  const text = [item.caption, item.content, item.kind, item.source].filter(Boolean).join(' ');
  const fromText = inferFromText(text);
  const fromSource = SOURCE_DEFAULT_DIMENSIONS[item.source] ?? ['alignment_with_future_self'];
  const dimensionHints = uniqueDimensions([...fromText, ...fromSource]);

  const hasRichText = text.trim().length >= 40;
  const hasMetrics = Boolean(item.metrics && Object.keys(item.metrics).length > 0);
  const confidence: SourceAnalysis['confidence'] =
    hasRichText && hasMetrics ? 'medium' : hasRichText || hasMetrics ? 'low' : 'low';

  return {
    summary: buildSummary(item),
    dimensionHints,
    confidence,
    keywords: fromText.length > 0 ? dimensionHints : fromSource
  };
}
