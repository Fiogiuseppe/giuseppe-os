import type { SourceProviderId } from '../../sources/providers/source-provider.types';
import type { KnowledgeExtractor } from './knowledge-extractor.types';
import { websiteKnowledgeExtractor } from './website-knowledge.extractor';

const EXTRACTORS: KnowledgeExtractor[] = [websiteKnowledgeExtractor];

export function getKnowledgeExtractor(sourceId: SourceProviderId): KnowledgeExtractor | null {
  return EXTRACTORS.find(extractor => extractor.sourceIds.includes(sourceId)) ?? null;
}

export function listKnowledgeExtractors(): KnowledgeExtractor[] {
  return [...EXTRACTORS];
}
