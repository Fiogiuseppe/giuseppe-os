import type { KnowledgeType } from '../../knowledge/models/knowledge.types';
import type { SourceProviderId } from '../../sources/config/source-config';
import type { IntelligenceKnowledgeQuery } from '../../intelligence/read/intelligence-read.types';

export const BRAIN_SUMMARY_MODE = 'deterministic_evidence_summary' as const;

export type BrainSummaryMode = typeof BRAIN_SUMMARY_MODE;

export const BRAIN_UNKNOWN_SUMMARY =
  "I don't know based on the synchronized evidence." as const;

export type BrainSummaryRequest = {
  topic?: string;
  owner?: string;
  sourceId?: string;
  knowledgeType?: KnowledgeType;
};

export type BrainSummaryEvidenceItem = {
  id: string;
  label: string;
  knowledgeType: KnowledgeType;
  summary: string;
  evidenceUrls: string[];
  confidence: number;
};

export type BrainSummaryGroup = {
  sourceId: SourceProviderId;
  items: BrainSummaryEvidenceItem[];
};

export type BrainSummaryResponse = {
  summary: string;
  groups: BrainSummaryGroup[];
  evidenceUrls: string[];
  confidence: number;
  mode: BrainSummaryMode;
  query: IntelligenceKnowledgeQuery;
};

export type DerivedSummaryQuery = {
  query: IntelligenceKnowledgeQuery;
  reason: string;
};
