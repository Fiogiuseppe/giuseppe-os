'use client';

import type { AwarenessInsight } from '../../engine/awarenessEngine';
import { formatConfidenceDisplay } from '../lib/formatConfidence';
import { useLanguage } from '../lib/i18n/LanguageContext';
import { DisclosurePanel } from './Disclosure';
import { AiOutputCard } from './AiOutputCard';
export type InsightsFocus = 'why' | 'patterns' | 'evidence' | 'reflect' | 'action' | null;

type InsightsStageProps = {
  loading: boolean;
  error: string | null;
  awareness: AwarenessInsight | null;
  insightCard?: {
    title: string;
    body: string;
    nextAction: string;
  } | null;
  focus: InsightsFocus;
  patterns: string[];
  onFocusChange: (focus: InsightsFocus) => void;
};

const FOCUS_ACTIONS = [
  { id: 'why', labelKey: 'tellMeMore' },
  { id: 'patterns', labelKey: 'patterns' },
  { id: 'evidence', labelKey: 'showEvidence' },
  { id: 'reflect', labelKey: 'reflect' },
  { id: 'action', labelKey: 'suggestedAction' }
] as const;

export function InsightsStage({
  loading,
  error,
  awareness,
  insightCard,
  focus,
  patterns,
  onFocusChange
}: InsightsStageProps) {
  const { t } = useLanguage();

  if (loading) {
    return (
      <div className="insights-stage" data-testid="insights-stage">
        <h1 className="insights-stage-title view-title">{t('viewHeadings.insights')}</h1>
        <p className="insights-stage-loading">{t('today.loading')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="insights-stage" data-testid="insights-stage">
        <h1 className="insights-stage-title view-title">{t('viewHeadings.insights')}</h1>
        <p className="insights-stage-error">{error}</p>
      </div>
    );
  }

  if (!awareness) {
    return null;
  }

  if (focus !== null) {
    return (
      <div className="insights-focus-stage reading-focus-view" data-testid="insights-focus-stage">
        <button type="button" className="reading-expand-close" onClick={() => onFocusChange(null)}>
          <span aria-hidden="true">←</span> {t('disclosure.closeReading')}
        </button>

        <DisclosurePanel open={focus === 'why'}>
          <div className="insights-focus-panel discovery-panel">
            <p>{awareness.whyItMatters}</p>
          </div>
        </DisclosurePanel>

        <DisclosurePanel open={focus === 'patterns'}>
          <div className="insights-focus-panel discovery-panel">
            <div className="kicker">{t('insights.patternsTitle')}</div>
            <ul>{patterns.map(item => <li key={item}>{item}</li>)}</ul>
            <div className="kicker">{t('insights.blindSpotsTitle')}</div>
            <p>{patterns[0]}</p>
          </div>
        </DisclosurePanel>

        <DisclosurePanel open={focus === 'evidence'}>
          <div className="insights-focus-panel discovery-panel">
            <div className="kicker">{t('kickers.evidence')}</div>
            <ul>{awareness.evidence.map(item => <li key={item}>{item}</li>)}</ul>
            <div className="kicker">{t('kickers.riskIfIgnored')}</div>
            <p>{awareness.riskIfIgnored}</p>
          </div>
        </DisclosurePanel>

        <DisclosurePanel open={focus === 'reflect'}>
          <div className="insights-focus-panel discovery-panel">
            <div className="kicker">{t('kickers.reflect')}</div>
            <p>{awareness.reflectionQuestion}</p>
          </div>
        </DisclosurePanel>

        <DisclosurePanel open={focus === 'action'}>
          <div className="insights-focus-panel discovery-panel">
            <div className="kicker">{t('kickers.recommendedAction')}</div>
            <p>{awareness.recommendedAction}</p>
            <div className="kicker">{t('kickers.confidence')}</div>
            <div className="potential-score">
              {formatConfidenceDisplay(t, awareness.confidenceScore, awareness.confidenceLabel)}
            </div>
          </div>
        </DisclosurePanel>
      </div>
    );
  }

  return (
    <div className="insights-stage" data-testid="insights-stage">
      <h1 className="insights-stage-title view-title">{t('viewHeadings.insights')}</h1>

      <AiOutputCard
        kicker={t('aiCards.onlineInsight')}
        title={insightCard?.title ?? awareness.headline}
        body={insightCard?.body ?? awareness.insight}
        nextAction={insightCard?.nextAction ?? awareness.recommendedAction}
        nextActionKicker={t('kickers.recommendedAction')}
        testId="insight-ai-card"
      />

      <div className="insights-action-grid" role="group" aria-label={t('nav.insights')}>
        {FOCUS_ACTIONS.map(action => (
          <button
            key={action.id}
            type="button"
            className="insights-action-chip"
            onClick={() => onFocusChange(action.id)}
          >
            {t(`disclosure.${action.labelKey}`)}
            <span aria-hidden="true">→</span>
          </button>
        ))}
      </div>

      <p className="insights-built-over-time">{t('insights.builtOverTime')}</p>
    </div>
  );
}
