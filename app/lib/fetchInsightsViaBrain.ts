import type { AwarenessInsight } from '../../engine/awarenessEngine';

export type FetchInsightsResult =
  | { ok: true; awareness: AwarenessInsight; headline?: string }
  | { ok: false; message: string; status: number };

export async function fetchInsightsViaBrain(locale: 'it' | 'en' = 'it'): Promise<FetchInsightsResult> {
  const response = await fetch('/api/brain', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      intent: 'awareness',
      message: 'Scan for patterns and risks.',
      persist: true,
      locale
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

  if (!body.awareness) {
    return {
      ok: false,
      status: 502,
      message: 'Risposta insights incompleta dal Brain.'
    };
  }

  return {
    ok: true,
    awareness: body.awareness as AwarenessInsight,
    headline: typeof body.headline === 'string' ? body.headline : undefined
  };
}
