import type { SafeKnowledgeItem } from '../../knowledge/models/knowledge.types';
import type { SourceProviderId } from '../../sources/config/source-config';
import type { IntelligenceKnowledgeQuery } from '../../intelligence/read/intelligence-read.types';
import {
  BRAIN_UNKNOWN_SUMMARY,
  type BrainSummaryEvidenceItem,
  type BrainSummaryGroup,
  type DerivedSummaryQuery
} from './brain-summary.types';
import { isKnowledgeOwner, isKnowledgeType } from '../../intelligence/read/intelligence-read.types';
import { normalizeSourceId } from '../../sources/providers/source-registry';

const SOURCE_LABELS: Partial<Record<SourceProviderId, string>> = {
  website_personal: 'fiogiuseppe.com',
  website_urees: 'UREES Website',
  medium_personal: 'Medium'
};

function formatSourceLabel(sourceId: SourceProviderId): string {
  return SOURCE_LABELS[sourceId] ?? sourceId;
}

function normalizeTopic(topic: string): string {
  return topic.trim().toLowerCase();
}

/** Map summary request fields to Intelligence Read queries — deterministic, no LLM. */
export function deriveKnowledgeQueryFromSummaryRequest(input: {
  topic?: string;
  owner?: string;
  sourceId?: string;
  knowledgeType?: string;
}): DerivedSummaryQuery | null {
  const query: IntelligenceKnowledgeQuery = {};

  if (input.owner) {
    if (!isKnowledgeOwner(input.owner)) {
      return null;
    }
    query.owner = input.owner;
  }

  if (input.sourceId) {
    const normalized = normalizeSourceId(input.sourceId);
    if (!normalized) {
      return null;
    }
    query.sourceId = normalized;
  }

  if (input.knowledgeType) {
    if (!isKnowledgeType(input.knowledgeType)) {
      return null;
    }
    query.knowledgeType = input.knowledgeType;
  }

  if (input.topic) {
    const trimmed = input.topic.trim();
    if (!trimmed) {
      return null;
    }

    const normalized = normalizeTopic(trimmed);
    if (/^projects?$/.test(normalized)) {
      query.knowledgeType = 'project';
      return { query, reason: 'topic requests project summary' };
    }

    if (/^topics?$/.test(normalized) || /^themes?$/.test(normalized)) {
      query.knowledgeType = 'topic';
      return { query, reason: 'topic requests topic summary' };
    }

    query.q = trimmed;
    return { query, reason: `topic search for "${trimmed}"` };
  }

  if (Object.keys(query).length === 0) {
    return null;
  }

  return { query, reason: 'explicit summary filters' };
}

export function toBrainSummaryEvidenceItem(item: SafeKnowledgeItem): BrainSummaryEvidenceItem {
  return {
    id: item.id,
    label: item.label,
    knowledgeType: item.knowledgeType,
    summary: item.summary,
    evidenceUrls: [...item.evidenceUrls],
    confidence: item.confidence
  };
}

export function groupKnowledgeBySource(items: SafeKnowledgeItem[]): BrainSummaryGroup[] {
  const grouped = new Map<SourceProviderId, SafeKnowledgeItem[]>();

  for (const item of items) {
    const bucket = grouped.get(item.sourceId) ?? [];
    bucket.push(item);
    grouped.set(item.sourceId, bucket);
  }

  return Array.from(grouped.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([sourceId, bucket]) => ({
      sourceId,
      items: bucket.map(toBrainSummaryEvidenceItem)
    }));
}

export function collectEvidenceUrls(groups: BrainSummaryGroup[]): string[] {
  const urls = new Set<string>();

  for (const group of groups) {
    for (const item of group.items) {
      for (const url of item.evidenceUrls) {
        urls.add(url);
      }
    }
  }

  return Array.from(urls).sort();
}

function averageConfidence(items: SafeKnowledgeItem[]): number {
  if (items.length === 0) {
    return 0;
  }

  const total = items.reduce((sum, item) => sum + item.confidence, 0);
  return Number((total / items.length).toFixed(2));
}

function formatItemLine(item: BrainSummaryEvidenceItem): string {
  return `${item.label} (${item.knowledgeType}): ${item.summary}`;
}

function formatGroupLines(group: BrainSummaryGroup): string {
  const lines = group.items.map(formatItemLine);
  return `From ${formatSourceLabel(group.sourceId)}: ${lines.join('; ')}`;
}

function formatOwnerSummary(groups: BrainSummaryGroup[], itemCount: number): string {
  const sourceNames = groups.map(group => formatSourceLabel(group.sourceId)).join(', ');
  const groupText = groups.map(formatGroupLines).join(' ');
  return `Based on synchronized knowledge across ${groups.length} source${groups.length === 1 ? '' : 's'} (${sourceNames}), Giuseppe has ${itemCount} knowledge item${itemCount === 1 ? '' : 's'}. ${groupText}`;
}

function formatSourceSummary(sourceId: SourceProviderId, groups: BrainSummaryGroup[]): string {
  const group = groups[0];
  if (!group) {
    return BRAIN_UNKNOWN_SUMMARY;
  }

  const lines = group.items.map(formatItemLine).join('; ');
  return `From ${formatSourceLabel(sourceId)}, synchronized knowledge includes ${group.items.length} item${group.items.length === 1 ? '' : 's'}: ${lines}`;
}

function formatTopicSummary(topic: string, groups: BrainSummaryGroup[]): string {
  const groupText = groups.map(formatGroupLines).join(' ');
  return `What we know about "${topic}" from synchronized evidence across ${groups.length} source${groups.length === 1 ? '' : 's'}. ${groupText}`;
}

function formatKnowledgeTypeSummary(
  knowledgeType: string,
  groups: BrainSummaryGroup[],
  itemCount: number
): string {
  const groupText = groups.map(formatGroupLines).join(' ');
  return `Synchronized ${knowledgeType} knowledge (${itemCount} item${itemCount === 1 ? '' : 's'}) grouped by source. ${groupText}`;
}

export function generateEvidenceSummary(input: {
  query: IntelligenceKnowledgeQuery;
  items: SafeKnowledgeItem[];
  groups: BrainSummaryGroup[];
}): { summary: string; confidence: number } {
  if (input.items.length === 0) {
    return { summary: BRAIN_UNKNOWN_SUMMARY, confidence: 0 };
  }

  const confidence = averageConfidence(input.items);

  if (input.query.sourceId) {
    return {
      summary: formatSourceSummary(input.query.sourceId, input.groups),
      confidence
    };
  }

  if (input.query.knowledgeType === 'project' || input.query.knowledgeType === 'topic') {
    return {
      summary: formatKnowledgeTypeSummary(input.query.knowledgeType, input.groups, input.items.length),
      confidence
    };
  }

  if (input.query.q) {
    return {
      summary: formatTopicSummary(input.query.q, input.groups),
      confidence
    };
  }

  return {
    summary: formatOwnerSummary(input.groups, input.items.length),
    confidence
  };
}
