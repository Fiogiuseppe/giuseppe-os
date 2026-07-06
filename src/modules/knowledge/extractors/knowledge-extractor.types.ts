import type { EvidenceItem } from '../../../../lib/data-sources/types';
import type { SourceProviderId } from '../../sources/providers/source-provider.types';
import type { KnowledgeOwner, KnowledgeType } from '../models/knowledge.types';

export type KnowledgeExtractionCandidate = {
  knowledgeType: KnowledgeType;
  label: string;
  summary: string;
  confidence: number;
  evidenceId: string;
  evidenceUrl: string;
  metadata?: Record<string, unknown>;
};

export type KnowledgeExtractorInput = {
  owner: KnowledgeOwner;
  sourceId: SourceProviderId;
  sourceType: string;
  evidence: EvidenceItem[];
};

export type KnowledgeExtractor = {
  sourceIds: SourceProviderId[];
  extract(input: KnowledgeExtractorInput): KnowledgeExtractionCandidate[];
};
