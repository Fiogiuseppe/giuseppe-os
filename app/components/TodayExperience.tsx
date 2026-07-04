'use client';

import type { TodayResponse } from '../../lib/today/types';
import { limitWords } from '../../lib/todays-letter/parse';
import { MAX_TODAY_ONE_BIG_MOVE_WORDS } from '../../lib/todays-letter/prompt';
import { useLanguage } from '../lib/i18n/LanguageContext';
import { TodayExecuteAction } from './TodayExecuteAction';

type TodayExperienceProps = {
  today: TodayResponse;
  onOpenDecisions?: () => void;
  variant?: 'desktop' | 'mobile';
};

export function TodayExperience({ today, onOpenDecisions, variant = 'desktop' }: TodayExperienceProps) {
  const { t } = useLanguage();
  const move = limitWords(today.payload.next_action, MAX_TODAY_ONE_BIG_MOVE_WORDS);

  const content = (
    <>
      {today.isFallback ? (
        <p className="today-fallback-notice" data-testid="today-fallback-notice">
          {t('today.fallbackNotice')}
        </p>
      ) : null}

      <p
        className={variant === 'mobile' ? 'today-ritual-line today-ritual-action' : 'today-action-text'}
        data-testid="today-move"
      >
        {move}
      </p>

      <TodayExecuteAction
        oneBigMove={move}
        actionKind={today.actionKind}
        actionTopic={today.actionTopic}
        onOpenDecisions={onOpenDecisions}
      />
    </>
  );

  return (
    <div
      className={`today-experience today-experience--${variant}`}
      data-testid="today-experience"
    >
      {content}
    </div>
  );
}
