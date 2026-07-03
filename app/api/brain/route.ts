import { mapBrainError, runExecutiveBrain } from '../../../lib/brain/executiveBrain';
import type { BrainIntent, BrainRequest } from '../../../lib/brain/types';

const INTENTS: BrainIntent[] = [
  'auto',
  'query',
  'decide',
  'reflect',
  'awareness',
  'potential',
  'learn'
];

function parseIntent(value: unknown): BrainIntent | null {
  if (typeof value === 'string' && INTENTS.includes(value as BrainIntent)) {
    return value as BrainIntent;
  }
  return null;
}

function parseRequest(body: Record<string, unknown>): BrainRequest {
  const intent = parseIntent(body.intent);
  if (!intent) {
    throw new Error('Invalid intent.');
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
    version: '1.0-intelligence-foundation',
    intents: INTENTS.filter(intent => intent !== 'auto'),
    architecture: [
      'executive-brain',
      'context-builder',
      'ai-provider',
      'memory-update',
      'learning-engine',
      'reality-layer'
    ]
  });
}
