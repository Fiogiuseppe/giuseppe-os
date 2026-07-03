import { mapBrainError, runExecutiveBrain } from '../../../lib/brain/executiveBrain';
import type { BrainIntent, BrainRequest } from '../../../lib/brain/types';

function parseIntent(value: unknown): BrainIntent | null {
  if (value === 'query' || value === 'decide' || value === 'reflect') {
    return value;
  }
  return null;
}

function parseRequest(body: Record<string, unknown>): BrainRequest {
  const intent = parseIntent(body.intent);
  if (!intent) {
    throw new Error('Invalid intent. Use query, decide, or reflect.');
  }

  return {
    intent,
    message: typeof body.message === 'string' ? body.message : '',
    decision: typeof body.decision === 'string' ? body.decision : undefined,
    reason: typeof body.reason === 'string' ? body.reason : undefined
  };
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const payload = parseRequest(body);
    const response = await runExecutiveBrain(payload);
    return Response.json(response);
  } catch (error) {
    const mapped = mapBrainError(error);
    return Response.json({ error: mapped.message }, { status: mapped.status });
  }
}

export async function GET() {
  return Response.json({
    status: 'ok',
    service: 'giuseppe-brain',
    intents: ['query', 'decide', 'reflect']
  });
}
