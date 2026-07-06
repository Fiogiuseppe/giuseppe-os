import type { SourceProviderId } from '../../sources/providers/source-provider.types';
import type { KnowledgeExtractor } from './knowledge-extractor.types';
import { mediumKnowledgeExtractor } from './medium-knowledge.extractor';
import { websiteKnowledgeExtractor } from './website-knowledge.extractor';

const EXTRACTORS: KnowledgeExtractor[] = [websiteKnowledgeExtractor, mediumKnowledgeExtractor];

export function getKnowledgeExtractor(sourceId: SourceProviderId): KnowledgeExtractor | null {
  return EXTRACTORS.find(extractor => extractor.sourceIds.includes(sourceId)) ?? null;
}

export function listKnowledgeExtractors(): KnowledgeExtractor[] {
  return [...EXTRACTORS];
}
