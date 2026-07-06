import { readKnowledge } from '../../intelligence/read/intelligence-read.server';
import {
  BRAIN_ANSWER_MODE,
  type BrainAnswerRequest,
  type BrainAnswerResponse
} from './brain-answer.types';
import {
  deriveKnowledgeQueryFromQuestion,
  generateEvidenceAnswer,
  toBrainEvidenceRef
} from './evidence-answer.generator';

/** Evidence-only Brain answers — queries Intelligence Read Layer, no LLM. */
export async function answerFromEvidence(
  input: BrainAnswerRequest
): Promise<BrainAnswerResponse> {
  const question = input.question.trim();
  if (!question) {
    throw new Error('Question is required.');
  }

  const { query } = deriveKnowledgeQueryFromQuestion(question);
  const readResult = await readKnowledge(query);

  const generated = generateEvidenceAnswer({
    question,
    query: readResult.query,
    items: readResult.items
  });

  return {
    answer: generated.answer,
    evidence: readResult.items.map(toBrainEvidenceRef),
    confidence: generated.confidence,
    mode: BRAIN_ANSWER_MODE,
    query: readResult.query
  };
}
