import { summarizeFromEvidence } from '../../../../src/modules/brain/summary/brain-summary.server';
import type { KnowledgeType } from '../../../../src/modules/knowledge/models/knowledge.types';

/** Deterministic evidence summaries from synchronized knowledge — no external LLM. */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;

    const response = await summarizeFromEvidence({
      topic: typeof body.topic === 'string' ? body.topic : undefined,
      owner: typeof body.owner === 'string' ? body.owner : undefined,
      sourceId: typeof body.sourceId === 'string' ? body.sourceId : undefined,
      knowledgeType: typeof body.knowledgeType === 'string' ? (body.knowledgeType as KnowledgeType) : undefined
    });

    return Response.json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to generate evidence summary.';
    return Response.json({ error: message }, { status: 400 });
  }
}
