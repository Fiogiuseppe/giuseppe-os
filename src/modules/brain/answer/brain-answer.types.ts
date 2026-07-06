import type { KnowledgeType } from '../../knowledge/models/knowledge.types';
import type { IntelligenceKnowledgeQuery } from '../../intelligence/read/intelligence-read.types';

export const BRAIN_ANSWER_MODE = 'deterministic_evidence_answer' as const;

export type BrainAnswerMode = typeof BRAIN_ANSWER_MODE;

export const BRAIN_UNKNOWN_ANSWER =
  "I don't know based on the synchronized evidence" as const;

export type BrainAnswerRequest = {
  question: string;
};

export type BrainEvidenceRef = {
  id: string;
  label: string;
  knowledgeType: KnowledgeType;
  summary: string;
  sourceId: string;
  evidenceUrls: string[];
  confidence: number;
};

export type BrainAnswerResponse = {
  answer: string;
  evidence: BrainEvidenceRef[];
  confidence: number;
  mode: BrainAnswerMode;
  query: IntelligenceKnowledgeQuery;
};

export type DerivedKnowledgeQuery = {
  query: IntelligenceKnowledgeQuery;
  reason: string;
};
