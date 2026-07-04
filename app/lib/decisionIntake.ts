import type { DecisionIntakeResponse } from '../../lib/brain/decisions/intake';

export type DecisionIntakeResult =
  | { ok: true; intake: DecisionIntakeResponse }
  | { ok: false; message: string; status: number };

export async function fetchDecisionIntake(params: {
  decision: string;
  answers: Record<string, string>;
  locale?: 'it' | 'en';
}): Promise<DecisionIntakeResult> {
  const response = await fetch('/api/decisions/intake', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      message: typeof body.error === 'string' ? body.error : 'Decision intake unavailable.'
    };
  }

  return {
    ok: true,
    intake: body as DecisionIntakeResponse
  };
}
