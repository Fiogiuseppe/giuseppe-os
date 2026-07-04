import { NextResponse } from 'next/server';
import { runDecisionIntake } from '../../../../lib/brain/decisions/intake';
import type { DecisionIntakeRequest } from '../../../../lib/brain/decisions/intake';
import { loadBrain, loadLongTermMemory } from '../../../../lib/brain/memory/store';

function parseBody(body: Record<string, unknown>): DecisionIntakeRequest {
  const decision = typeof body.decision === 'string' ? body.decision.trim() : '';
  if (!decision) {
    throw new Error('Decision is required.');
  }

  const answers =
    body.answers && typeof body.answers === 'object' && !Array.isArray(body.answers)
      ? (body.answers as Record<string, string>)
      : {};

  const locale = body.locale === 'en' ? 'en' : 'it';

  return { decision, answers, locale };
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const payload = parseBody(body);
    const [brain, longTerm] = await Promise.all([loadBrain(), loadLongTermMemory()]);
    const response = runDecisionIntake(payload, brain, longTerm);
    return NextResponse.json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Decision intake failed.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
