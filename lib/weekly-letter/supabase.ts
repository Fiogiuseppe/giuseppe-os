import { isSupabaseConfigured, getSupabaseClient } from '../memory/supabase/client';
import type { StoredWeeklyLetter, WeeklyLetterResponse } from './types';

type DbWeeklyLetter = {
  week_key: string;
  week_number: number;
  date_range: string;
  week_label: string;
  locale: string;
  content: Record<string, unknown>;
  evidence: Record<string, unknown>;
  source: string;
  generated_at: string;
  html_body: string | null;
  email_sent_at: string | null;
  thin_evidence: boolean;
};

function parseStored(row: DbWeeklyLetter): StoredWeeklyLetter {
  const content = row.content as StoredWeeklyLetter['content'];
  const evidence = row.evidence as StoredWeeklyLetter['evidence'];

  return {
    weekKey: row.week_key,
    weekNumber: row.week_number,
    dateRange: row.date_range,
    weekLabel: row.week_label,
    content,
    evidence,
    source: row.source as StoredWeeklyLetter['source'],
    generatedAt: row.generated_at,
    cached: true,
    thinEvidence: row.thin_evidence,
    htmlBody: row.html_body ?? '',
    emailSentAt: row.email_sent_at
  };
}

export function isWeeklyLetterStoreConfigured(): boolean {
  return isSupabaseConfigured();
}

export async function loadWeeklyLetterFromSupabase(weekKey: string): Promise<StoredWeeklyLetter | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('weekly_letters')
    .select('*')
    .eq('week_key', weekKey)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  return parseStored(data as DbWeeklyLetter);
}

export async function saveWeeklyLetterToSupabase(
  letter: WeeklyLetterResponse,
  htmlBody: string
): Promise<void> {
  if (!isSupabaseConfigured()) {
    return;
  }

  const supabase = getSupabaseClient();
  const { error } = await supabase.from('weekly_letters').upsert(
    {
      week_key: letter.weekKey,
      week_number: letter.weekNumber,
      date_range: letter.dateRange,
      week_label: letter.weekLabel,
      locale: 'en',
      content: letter.content,
      evidence: letter.evidence,
      source: letter.source,
      generated_at: letter.generatedAt,
      html_body: htmlBody,
      thin_evidence: letter.thinEvidence,
      updated_at: new Date().toISOString()
    },
    { onConflict: 'week_key' }
  );

  if (error) {
    throw error;
  }
}

export async function markWeeklyLetterEmailSent(weekKey: string, sentAt: string): Promise<void> {
  if (!isSupabaseConfigured()) {
    return;
  }

  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from('weekly_letters')
    .update({ email_sent_at: sentAt, updated_at: new Date().toISOString() })
    .eq('week_key', weekKey);

  if (error) {
    throw error;
  }
}
