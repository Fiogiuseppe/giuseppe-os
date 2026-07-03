import type { TodaysLetterResponse } from '../../lib/todays-letter/types';

export type FetchTodaysLetterResult =
  | { ok: true; letter: TodaysLetterResponse }
  | { ok: false; message: string; status: number };

export async function fetchTodaysLetter(): Promise<FetchTodaysLetterResult> {
  const response = await fetch('/api/todays-letter', { method: 'POST' });
  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      message:
        typeof body.error === 'string'
          ? body.error
          : 'Giuseppe OS non ha potuto preparare la lettera di oggi.'
    };
  }

  if (!body.letter || !body.sections) {
    return {
      ok: false,
      status: 502,
      message: 'Lettera di oggi incompleta.'
    };
  }

  return {
    ok: true,
    letter: body as TodaysLetterResponse
  };
}
