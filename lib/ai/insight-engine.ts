import type { AwarenessInsight } from '../../engine/awarenessEngine';
import { runAwarenessEngine } from '../../engine/awarenessEngine';
import { buildGiuseppeSystemPrompt, buildAppContextBlock } from './app-context';
import { runWithAICallMeta } from './callContext';
import { isAILiveMode } from './mode';
import { completeJsonWithProviderChain } from './jsonProviderChain';
import { loadLongTermMemory, loadWorkingMemory } from '../brain/memory/store';
import { loadStrongestPatterns } from '../self-model/summary';
import { pickLocale, resolveLocale, type AppLocale } from '../i18n/locale';
import { buildPresenceSignals } from '../presence/summarize';
import { runPresenceScan } from '../presence/run';
import { ORACLE_EVIDENCE_RULE } from '../oracle/voiceRules';
import {
  clearCachedMonthlyInsight,
  insightMonthKey,
  readCachedMonthlyInsight,
  writeCachedMonthlyInsight
} from '../insights/monthlyInsight';

export type InsightCard = {
  title: string;
  body: string;
  nextAction: string;
  onlineSignals: string[];
};

export type InsightEngineSource = 'ai' | 'local';

export type OnlineSignalSource = 'web' | 'unavailable';

export type InsightEngineResponse = {
  insight: AwarenessInsight;
  card: InsightCard;
  monthKey: string;
  source: InsightEngineSource;
  cached: boolean;
  provider?: string;
};

type ParsedInsightPayload = {
  headline?: string;
  insight?: string;
  whyItMatters?: string;
  recommendedAction?: string;
  nextAction?: string;
  riskIfIgnored?: string;
  reflectionQuestion?: string;
  evidence?: string[];
  confidenceScore?: number;
};

export async function fetchOnlineSignals(
  localeInput?: AppLocale
): Promise<{ signals: string[]; source: OnlineSignalSource }> {
  const locale = resolveLocale(localeInput);

  try {
    const report = await runPresenceScan(locale);
    const signals = buildPresenceSignals(locale, report.items, report.comments);
    if (signals.length > 0) {
      if (report.missionSuggestion) {
        signals.push(report.missionSuggestion);
      }
      return { source: 'web', signals };
    }
  } catch {
    // No live signals — return unavailable instead of invented placeholders.
  }

  return { source: 'unavailable', signals: [] };
}

function buildInsightPrompt(params: {
  locale: AppLocale;
  onlineSignals: string[];
  signalSource: OnlineSignalSource;
  localInsight: AwarenessInsight;
}): string {
  const language = params.locale === 'en' ? 'English' : 'Italian';
  const sections = [
    'You are Giuseppe OS Insight AI — generate one personalized insight for Giuseppe.',
    'Respond with JSON only (no markdown fences).',
    '',
    'Required JSON keys:',
    '- headline (string)',
    '- insight (string — the core observation)',
    '- whyItMatters (string)',
    '- recommendedAction (string)',
    '- nextAction (string — one concrete step within 7 days)',
    '- riskIfIgnored (string)',
    '- reflectionQuestion (string)',
    '- evidence (string array, 2-4 items grounded in context)',
    '- confidenceScore (number 0-100)',
    '',
    `Write all string values in ${language}.`,
    '',
    buildAppContextBlock(),
    '',
    'LOCAL AWARENESS ENGINE (ground truth — refine, do not contradict blindly):',
    `Headline: ${params.localInsight.headline}`,
    `Insight: ${params.localInsight.insight}`,
    `Why it matters: ${params.localInsight.whyItMatters}`
  ];

  if (params.onlineSignals.length > 0) {
    sections.push(
      '',
      'ONLINE SIGNALS (verified from presence scan):',
      params.onlineSignals.map(signal => `- ${signal}`).join('\n')
    );
  } else {
    sections.push(
      '',
      'ONLINE SIGNALS: unavailable — do not invent external trends or placeholder market signals.',
      ORACLE_EVIDENCE_RULE,
      pickLocale(
        params.locale,
        'Se i segnali online non sono disponibili, dillo chiaramente invece di inventare trend.',
        'If online signals are unavailable, say so clearly instead of inventing trends.'
      )
    );
  }

  return sections.join('\n');
}

function parseInsightPayload(content: string): ParsedInsightPayload {
  try {
    const cleaned = content.trim().match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1]?.trim() ?? content.trim();
    return JSON.parse(cleaned) as ParsedInsightPayload;
  } catch {
    return {};
  }
}

function mergeInsight(
  local: AwarenessInsight,
  parsed: ParsedInsightPayload,
  onlineSignals: string[]
): { insight: AwarenessInsight; card: InsightCard } {
  const headline = parsed.headline ?? local.headline;
  const insightText = parsed.insight ?? local.insight;
  const whyItMatters = parsed.whyItMatters ?? local.whyItMatters;
  const recommendedAction = parsed.recommendedAction ?? local.recommendedAction;
  const nextAction = parsed.nextAction ?? recommendedAction ?? local.recommendedAction;

  const insight: AwarenessInsight = {
    ...local,
    headline,
    insight: insightText,
    whyItMatters,
    recommendedAction,
    confidenceScore:
      typeof parsed.confidenceScore === 'number' ? Math.round(parsed.confidenceScore) : local.confidenceScore,
    confidenceLabel:
      typeof parsed.confidenceScore === 'number' ? 'score' : local.confidenceLabel,
    riskIfIgnored: parsed.riskIfIgnored ?? local.riskIfIgnored,
    reflectionQuestion: parsed.reflectionQuestion ?? local.reflectionQuestion,
    evidence: parsed.evidence?.length ? parsed.evidence : local.evidence
  };

  return {
    insight,
    card: {
      title: headline,
      body: insightText,
      nextAction,
      onlineSignals
    }
  };
}

async function generateLocalInsight(locale: AppLocale): Promise<AwarenessInsight> {
  const [longTerm, working, selfModelPatterns] = await Promise.all([
    loadLongTermMemory(),
    loadWorkingMemory(),
    loadStrongestPatterns()
  ]);

  return runAwarenessEngine({
    proactive: true,
    longTerm,
    working,
    locale,
    selfModelPatterns: selfModelPatterns.map(pattern => pattern.pattern)
  });
}

async function generateLiveInsight(locale: AppLocale): Promise<{
  insight: AwarenessInsight;
  card: InsightCard;
  provider?: string;
}> {
  const local = await generateLocalInsight(locale);
  const { signals, source } = await fetchOnlineSignals(locale);
  const system = buildGiuseppeSystemPrompt();
  const userPrompt = buildInsightPrompt({
    locale,
    onlineSignals: signals,
    signalSource: source,
    localInsight: local
  });

  const completion = await runWithAICallMeta(
    { page: 'insights', reason: 'online-insight' },
    () =>
      completeJsonWithProviderChain(
        {
          system,
          messages: [{ role: 'user', content: userPrompt }],
          maxTokens: 1200,
          expectJson: true
        },
        { route: 'insight-engine', page: 'insights', reason: 'online-insight' }
      )
  );

  const parsed = parseInsightPayload(completion.content);
  const merged = mergeInsight(local, parsed, signals);

  return {
    ...merged,
    provider: completion.provider
  };
}

export type GenerateInsightOptions = {
  regenerate?: boolean;
};

export async function generateOnlineInsight(
  localeInput?: AppLocale,
  options: GenerateInsightOptions = {}
): Promise<InsightEngineResponse> {
  const locale = resolveLocale(localeInput);
  const monthKey = insightMonthKey();
  const regenerate = options.regenerate === true;

  if (regenerate) {
    if (!isAILiveMode()) {
      throw new Error('Live AI is disabled.');
    }
    clearCachedMonthlyInsight(monthKey, locale);
  } else {
    const cached = readCachedMonthlyInsight(monthKey, locale);
    if (cached) {
      const online = await fetchOnlineSignals(locale);
      return {
        insight: cached.insight,
        card: {
          title: cached.insight.headline,
          body: cached.insight.insight,
          nextAction: cached.insight.recommendedAction,
          onlineSignals: online.signals
        },
        monthKey: cached.monthKey,
        source: cached.source === 'live' ? 'ai' : 'local',
        cached: true
      };
    }
  }

  if (isAILiveMode()) {
    const live = await generateLiveInsight(locale);
    const payload: InsightEngineResponse = {
      insight: live.insight,
      card: live.card,
      monthKey,
      source: 'ai',
      cached: false,
      provider: live.provider
    };

    writeCachedMonthlyInsight(monthKey, locale, {
      insight: live.insight,
      monthKey,
      source: 'live'
    });

    return payload;
  }

  const localInsight = await generateLocalInsight(locale);
  const online = await fetchOnlineSignals(locale);
  const payload: InsightEngineResponse = {
    insight: localInsight,
    card: {
      title: localInsight.headline,
      body: localInsight.insight,
      nextAction: localInsight.recommendedAction,
      onlineSignals: online.signals
    },
    monthKey,
    source: 'local',
    cached: false
  };

  writeCachedMonthlyInsight(monthKey, locale, {
    insight: localInsight,
    monthKey,
    source: 'local'
  });

  return payload;
}
