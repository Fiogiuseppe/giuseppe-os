import type { TodayActionKind } from './types';
import { TODAY_ACTION_KINDS } from './types';

export function parseTodayActionKind(value: unknown): TodayActionKind | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  const normalized = value.trim().toLowerCase() as TodayActionKind;
  return TODAY_ACTION_KINDS.includes(normalized) ? normalized : undefined;
}

export function inferTodayActionKind(oneBigMove: string): TodayActionKind {
  const text = oneBigMove.toLowerCase();

  if (/medium|articolo|article|saggio|essay|post lungo/.test(text)) {
    return 'write_medium';
  }

  if (/linkedin/.test(text)) {
    return 'write_linkedin';
  }

  if (/instagram|story/.test(text)) {
    return 'write_instagram';
  }

  if (/decid|scegli|valuta se|choice|decision/.test(text)) {
    return 'open_decisions';
  }

  if (/scriv|pubblic|post|draft|bozza|write|publish/.test(text)) {
    return 'write_medium';
  }

  return 'none';
}

export function resolveTodayAction(params: {
  oneBigMove: string;
  actionKind?: TodayActionKind;
  actionTopic?: string;
}): { kind: TodayActionKind; topic: string } {
  const kind = params.actionKind ?? inferTodayActionKind(params.oneBigMove);
  const topic = params.actionTopic?.trim() || params.oneBigMove.trim();

  return { kind, topic };
}
