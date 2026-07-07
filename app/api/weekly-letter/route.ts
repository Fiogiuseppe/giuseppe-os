import { EmailConfigurationError, EmailDeliveryError, sendWeeklyLetterEmail } from '../../../lib/email/send';
import { generateWeeklyLetter, mapWeeklyLetterError } from '../../../lib/weekly-letter/generate';
import { weeklyLetterSubject } from '../../../lib/weekly-letter/renderEmail';
import {
  isWeeklyLetterStoreConfigured,
  loadWeeklyLetterFromSupabase,
  markWeeklyLetterEmailSent
} from '../../../lib/weekly-letter/supabase';
import { weeklyLetterWeekKey } from '../../../lib/weekly-letter/week';

export const runtime = 'nodejs';

function authorizeCron(request: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) {
    return false;
  }

  const url = new URL(request.url);
  const querySecret = url.searchParams.get('secret');
  const authHeader = request.headers.get('authorization');
  const bearer = authHeader?.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;

  return querySecret === secret || bearer === secret;
}

function parseForce(request: Request): boolean {
  const url = new URL(request.url);
  return url.searchParams.get('force') === 'true';
}

export async function GET(request: Request) {
  if (!authorizeCron(request)) {
    return Response.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const weekKey = weeklyLetterWeekKey();
    const force = parseForce(request);

    if (!force && isWeeklyLetterStoreConfigured()) {
      const existing = await loadWeeklyLetterFromSupabase(weekKey);
      if (existing?.emailSentAt) {
        return Response.json({
          ok: true,
          weekKey,
          cached: true,
          sent: true,
          alreadySent: true,
          sentAt: existing.emailSentAt,
          source: existing.source
        });
      }
    }

    const letter = await generateWeeklyLetter('en', { regenerate: force });
    const result = await sendWeeklyLetterEmail(weeklyLetterSubject(letter), letter.htmlBody);
    const sentAt = new Date().toISOString();

    if (isWeeklyLetterStoreConfigured()) {
      await markWeeklyLetterEmailSent(weekKey, sentAt);
    }

    return Response.json({
      ok: true,
      weekKey: letter.weekKey,
      cached: letter.cached,
      sent: true,
      alreadySent: false,
      sentAt,
      messageId: result.id,
      source: letter.source,
      thinEvidence: letter.thinEvidence
    });
  } catch (error) {
    if (error instanceof EmailConfigurationError) {
      return Response.json({ ok: false, error: error.message }, { status: 503 });
    }

    if (error instanceof EmailDeliveryError) {
      return Response.json(
        { ok: false, error: 'Weekly Letter generated but email delivery failed.' },
        { status: error.status >= 400 && error.status < 600 ? error.status : 502 }
      );
    }

    const mapped = mapWeeklyLetterError(error);
    return Response.json({ ok: false, error: mapped.message }, { status: mapped.status });
  }
}

export async function POST(request: Request) {
  return GET(request);
}
