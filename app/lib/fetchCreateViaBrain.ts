import type { PotentialBrief } from '../../engine/potentialEngine';

export type FetchCreateResult =
  | { ok: true; potential: PotentialBrief; source?: 'local' | 'live' }
  | { ok: false; message: string; status: number };

export type FetchCreateOptions = {
  analyze?: boolean;
};

export async function fetchCreateViaBrain(
  locale: 'it' | 'en' = 'it',
  options: FetchCreateOptions = {}
): Promise<FetchCreateResult> {
  const response = await fetch('/api/create/brief', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      locale,
      analyze: options.analyze === true
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
          : 'Giuseppe OS non ha potuto preparare il brief creativo.'
    };
  }

  if (!body.potential) {
    return {
      ok: false,
      status: 502,
      message: 'Risposta Create incompleta.'
    };
  }

  return {
    ok: true,
    potential: body.potential as PotentialBrief,
    source: body.source
  };
}
