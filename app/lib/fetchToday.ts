import type { TodayResponse } from '../../lib/today/types';

export type FetchTodayResult =
  | { ok: true; today: TodayResponse }
  | { ok: false; message: string; status: number };

export type FetchTodayOptions = {
  regenerate?: boolean;
};

export async function fetchToday(
  locale: 'it' | 'en' = 'it',
  options: FetchTodayOptions = {}
): Promise<FetchTodayResult> {
  const params = new URLSearchParams({ locale });
  if (options.regenerate) {
    params.set('regenerate', 'true');
  }

  const response = await fetch(`/api/today?${params.toString()}`);
  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      message:
        typeof body.error === 'string'
          ? body.error
          : 'Giuseppe OS non ha potuto preparare Today.'
    };
  }

  if (!body.payload?.next_action) {
    return {
      ok: false,
      status: 502,
      message: 'Today incompleto.'
    };
  }

  return {
    ok: true,
    today: body as TodayResponse
  };
}
