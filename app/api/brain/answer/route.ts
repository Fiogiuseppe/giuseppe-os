import { answerFromEvidence } from '../../../../src/modules/brain/answer/brain-answer.server';

/** Deterministic evidence answers from synchronized knowledge — no external LLM. */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const question = typeof body.question === 'string' ? body.question.trim() : '';

    if (!question) {
      return Response.json({ error: 'Question is required.' }, { status: 400 });
    }

    const response = await answerFromEvidence({ question });
    return Response.json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to generate evidence answer.';
    return Response.json({ error: message }, { status: 400 });
  }
}
