'use client';

import type { DailyBriefingSections } from '../../lib/briefing/types';
import { limitWords } from '../../lib/todays-letter/parse';
import { MAX_TODAY_ONE_BIG_MOVE_WORDS } from '../../lib/todays-letter/prompt';
import { useLanguage } from '../lib/i18n/LanguageContext';
import { TodayExecuteAction } from './TodayExecuteAction';

type TodayRecommendationProps = {
  sections: DailyBriefingSections;
  onOpenDecisions?: () => void;
  variant?: 'desktop' | 'mobile';
};

export function TodayRecommendation({
  sections,
  onOpenDecisions,
  variant = 'desktop'
}: TodayRecommendationProps) {
  const { t } = useLanguage();
  const move = limitWords(sections.oneBigMove, MAX_TODAY_ONE_BIG_MOVE_WORDS);

  if (variant === 'mobile') {
    return (
      <>
        <p className="today-ritual-kicker">{t('today.recommendationKicker')}</p>
        <p className="today-ritual-line today-ritual-action" data-testid="today-ritual-action">
          {move}
        </p>
        <TodayExecuteAction
          oneBigMove={move}
          actionKind={sections.actionKind}
          actionTopic={sections.actionTopic}
          onOpenDecisions={onOpenDecisions}
        />
      </>
    );
  }

  return (
    <div className="today-recommendation" data-testid="today-recommendation">
      <p className="today-recommendation-kicker">{t('today.recommendationKicker')}</p>
      <p className="today-action-text">{move}</p>
      <TodayExecuteAction
        oneBigMove={move}
        actionKind={sections.actionKind}
        actionTopic={sections.actionTopic}
        onOpenDecisions={onOpenDecisions}
      />
    </div>
  );
}
