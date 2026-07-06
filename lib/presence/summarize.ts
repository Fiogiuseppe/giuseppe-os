import { pickLocale, type AppLocale } from '../i18n/locale';
import { loadBrain } from '../brain/memory/store';
import type { PresenceComment, PresenceItem } from './types';

function safeDate(value: string): Date {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date(0) : parsed;
}

function daysSince(iso: string): number {
  const ms = Date.now() - safeDate(iso).getTime();
  return Math.max(0, Math.floor(ms / 86_400_000));
}

function latestItem(items: PresenceItem[]): PresenceItem | null {
  return [...items].sort((a, b) => safeDate(b.publishedAt).getTime() - safeDate(a.publishedAt).getTime())[0] ?? null;
}

export function buildNarrativeSummary(
  locale: AppLocale,
  items: PresenceItem[],
  comments: PresenceComment[]
): string {
  const latest = latestItem(items);
  if (!latest) {
    return pickLocale(
      locale,
      'Nessun contenuto pubblico recente rilevato sui canali collegati.',
      'No recent public content detected on connected channels.'
    );
  }

  const age = daysSince(latest.publishedAt);
  const channelLabel =
    latest.channel === 'medium'
      ? 'Medium'
      : latest.channel === 'website'
        ? 'fiogiuseppe.com'
        : latest.channel === 'urees_website'
          ? 'urees.shop'
          : latest.channel === 'urees_instagram'
            ? '@urees__'
            : latest.channel;

  const commentNote =
    comments.length > 0
      ? pickLocale(
          locale,
          ` ${comments.length} commenti recenti da tenere a mente.`,
          ` ${comments.length} recent comment(s) worth noting.`
        )
      : '';

  return pickLocale(
    locale,
    `Ultimo segnale pubblico (${channelLabel}, ${age === 0 ? 'oggi' : `${age} giorni fa`}): «${latest.title}».${commentNote}`,
    `Latest public signal (${channelLabel}, ${age === 0 ? 'today' : `${age} day(s) ago`}): “${latest.title}”.${commentNote}`
  );
}

export async function buildMissionSuggestion(
  locale: AppLocale,
  items: PresenceItem[]
): Promise<string | null> {
  const brain = await loadBrain();
  const latest = latestItem(items);
  if (!latest) {
    return null;
  }

  const age = daysSince(latest.publishedAt);
  if (age > 14) {
    return pickLocale(
      locale,
      'Non pubblichi da più di due settimane sui canali monitorati. Una mossa questa settimana su Medium o LinkedIn rafforza Brand Giuseppe verso libertà 2036.',
      'You have not published on monitored channels for over two weeks. One move this week on Medium or LinkedIn strengthens Brand Giuseppe toward 2036 freedom.'
    );
  }

  if (latest.channel === 'medium' && age <= 7) {
    return pickLocale(
      locale,
      `Hai pubblicato «${latest.title}» su Medium di recente. Il passo naturale: un post LinkedIn che apre la conversazione e rimanda al pezzo — stesso filo design/play, zero nuovo fronte.`,
      `You recently published “${latest.title}” on Medium. Natural next step: a LinkedIn post that opens the conversation and points to the piece — same design/play thread, no new front.`
    );
  }

  if (latest.channel === 'urees_website' && age <= 14) {
    return pickLocale(
      locale,
      `UREES ha «${latest.title}» sullo shop. Pubblica su @urees__ con storytelling upcycling e link al prodotto — sostenibilità che alimenta Brand Giuseppe verso libertà 2036.`,
      `UREES has “${latest.title}” on the shop. Post on @urees__ with upcycling storytelling and a product link — sustainability that feeds Brand Giuseppe toward 2036 freedom.`
    );
  }

  const northStar = brain.north_star.toLowerCase();
  if (northStar.includes('liber') || northStar.includes('free')) {
    return pickLocale(
      locale,
      `Il contenuto recente alimenta reputazione designer. Collegalo esplicitamente a LEGO o Brand Giuseppe con una CTA chiara — publishing che diventa traiettoria, non solo visibilità.`,
      `Recent content feeds designer reputation. Tie it explicitly to LEGO or Brand Giuseppe with a clear CTA — publishing that becomes trajectory, not just visibility.`
    );
  }

  return null;
}

export function buildPresenceSignals(locale: AppLocale, items: PresenceItem[], comments: PresenceComment[]): string[] {
  const signals: string[] = [];
  const latest = latestItem(items);

  if (latest) {
    signals.push(
      pickLocale(
        locale,
        `Attività ${latest.channel}: «${latest.title}» (${daysSince(latest.publishedAt)}g fa).`,
        `${latest.channel} activity: “${latest.title}” (${daysSince(latest.publishedAt)}d ago).`
      )
    );
  }

  for (const comment of comments.slice(0, 3)) {
    signals.push(
      pickLocale(
        locale,
        `Commento su ${comment.channel} da ${comment.author}: ${comment.text.slice(0, 120)}`,
        `Comment on ${comment.channel} by ${comment.author}: ${comment.text.slice(0, 120)}`
      )
    );
  }

  return signals;
}
