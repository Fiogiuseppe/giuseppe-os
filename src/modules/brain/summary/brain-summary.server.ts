import { readKnowledge } from '../../intelligence/read/intelligence-read.server';
import {
  BRAIN_SUMMARY_MODE,
  type BrainSummaryRequest,
  type BrainSummaryResponse
} from './brain-summary.types';
import {
  collectEvidenceUrls,
  deriveKnowledgeQueryFromSummaryRequest,
  generateEvidenceSummary,
  groupKnowledgeBySource
} from './evidence-summary.generator';

/** Evidence-only Brain summaries — queries Intelligence Read Layer, no LLM. */
export async function summarizeFromEvidence(
  input: BrainSummaryRequest
): Promise<BrainSummaryResponse> {
  const derived = deriveKnowledgeQueryFromSummaryRequest(input);
  if (!derived) {
    throw new Error('A valid owner, sourceId, topic, or knowledgeType is required.');
  }

  const readResult = await readKnowledge(derived.query);
  const groups = groupKnowledgeBySource(readResult.items);
  const generated = generateEvidenceSummary({
    query: readResult.query,
    items: readResult.items,
    groups
  });

  return {
    summary: generated.summary,
    groups,
    evidenceUrls: collectEvidenceUrls(groups),
    confidence: generated.confidence,
    mode: BRAIN_SUMMARY_MODE,
    query: readResult.query
  };
}
