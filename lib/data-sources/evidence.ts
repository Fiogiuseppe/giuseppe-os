import type { SourceAnalysis } from './analyze';
import type { EvidenceItem, NormalizedSourceItem } from './types';

export function buildEvidenceAttribution(item: NormalizedSourceItem): string {
  return `${item.source}:${item.account}/${item.externalId}`;
}

export function buildEvidenceTraceId(item: NormalizedSourceItem): string {
  return `trace_${item.source}_${item.account}_${item.externalId}`;
}

function buildEvidenceId(item: NormalizedSourceItem): string {
  return `evidence_${item.source}_${item.account}_${item.externalId}`;
}

export function createEvidenceItem(
  item: NormalizedSourceItem,
  analysis: SourceAnalysis,
  now = new Date().toISOString()
): EvidenceItem {
  return {
    id: buildEvidenceId(item),
    normalizedItemId: item.id,
    source: item.source,
    account: item.account,
    attribution: buildEvidenceAttribution(item),
    summary: analysis.summary,
    dimensionHints: analysis.dimensionHints,
    confidence: analysis.confidence,
    traceId: buildEvidenceTraceId(item),
    publishedAt: item.publishedAt,
    permalink: item.permalink,
    createdAt: now
  };
}
