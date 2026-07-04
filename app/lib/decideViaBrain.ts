import type { DecisionAIResult } from '../../lib/brain/decisions/types';

export type DecideViaBrainResult =
  | { ok: true; decision: DecisionAIResult; missionAligned: boolean }
  | { ok: false; message: string; status: number };

export async function decideViaBrain(
  decision: string,
  answers: Record<string, string> = {},
  locale: 'it' | 'en' = 'it'
): Promise<DecideViaBrainResult> {
  const response = await fetch('/api/decisions/recommend', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      decision,
      answers,
      locale,
      persist: true
    })
  });

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      message:
        typeof body.error === 'string'
          ? body.error
          : 'Giuseppe OS Brain non disponibile. Verifica la configurazione AI.'
    };
  }

  if (!body.decision) {
    return {
      ok: false,
      status: 502,
      message: 'Risposta decisionale incompleta dal Brain.'
    };
  }

  return {
    ok: true,
    decision: body.decision as DecisionAIResult,
    missionAligned: Boolean(body.missionAligned)
  };
}
