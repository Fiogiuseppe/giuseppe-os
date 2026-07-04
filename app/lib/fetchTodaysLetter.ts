import type { DailyBriefingResponse } from '../../lib/briefing/types';

export type FetchTodaysLetterResult =
  | { ok: true; letter: DailyBriefingResponse }
  | { ok: false; message: string; status: number };

export type FetchTodaysLetterOptions = {
  regenerate?: boolean;
};

export async function fetchTodaysLetter(
  locale: 'it' | 'en' = 'it',
  options: FetchTodaysLetterOptions = {}
): Promise<FetchTodaysLetterResult> {
  const response = await fetch('/api/todays-letter', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      locale,
      regenerate: options.regenerate === true
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
          : 'Giuseppe OS non ha potuto preparare il briefing di oggi.'
    };
  }

  if ((!body.briefing && !body.letter) || !body.sections?.oneBigMove) {
    return {
      ok: false,
      status: 502,
      message: 'Briefing di oggi incompleto.'
    };
  }

  return {
    ok: true,
    letter: body as DailyBriefingResponse
  };
}
