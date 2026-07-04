import type { PotentialBrief } from '../../engine/potentialEngine';

export type FetchCreateResult =
  | { ok: true; potential: PotentialBrief }
  | { ok: false; message: string; status: number };

export async function fetchCreateViaBrain(): Promise<FetchCreateResult> {
  const response = await fetch('/api/brain', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      intent: 'potential',
      message: 'What should I focus on today?',
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

  if (!body.potentialBrief) {
    return {
      ok: false,
      status: 502,
      message: 'Risposta Create incompleta dal Brain.'
    };
  }

  return {
    ok: true,
    potential: body.potentialBrief as PotentialBrief
  };
}
