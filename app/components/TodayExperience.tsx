'use client';

import type { ReactNode } from 'react';
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

type TodayCardProps = {
  kicker: string;
  body: string;
  highlight?: boolean;
  testId?: string;
  children?: ReactNode;
};

function TodayCard({ kicker, body, highlight = false, testId, children }: TodayCardProps) {
  return (
    <article
      className={`today-card card${highlight ? ' today-card--highlight' : ''}`}
      data-testid={testId}
    >
      <div className="kicker">{kicker}</div>
      <p className="today-card-body">{body}</p>
      {children}
    </article>
  );
}

export function TodayExperience({ today, onOpenDecisions, variant = 'desktop' }: TodayExperienceProps) {
  const { t } = useLanguage();
  const { payload } = today;
  const nextAction = limitWords(payload.next_action, MAX_TODAY_ONE_BIG_MOVE_WORDS);

  const cards = (
    <>
      {today.isFallback ? (
        <p className="today-fallback-notice" data-testid="today-fallback-notice">
          {t('today.fallbackNotice')}
        </p>
      ) : null}

      <p className="today-greeting" data-testid="today-greeting">
        {payload.greeting}
      </p>

      <div className="today-cards" data-testid="today-cards">
        <TodayCard
          kicker={t('today.cards.mindfulReflection')}
          body={payload.mindful_reflection}
          testId="today-card-mindful"
        />
        <TodayCard
          kicker={t('today.cards.todayFocus')}
          body={payload.today_focus}
          testId="today-card-focus"
        />
        <TodayCard
          kicker={t('today.cards.nextAction')}
          body={nextAction}
          highlight
          testId="today-card-action"
        >
          <TodayExecuteAction
            oneBigMove={nextAction}
            actionKind={today.actionKind}
            actionTopic={today.actionTopic}
            onOpenDecisions={onOpenDecisions}
          />
        </TodayCard>
        <TodayCard
          kicker={t('today.cards.risk')}
          body={payload.risk_or_distraction}
          testId="today-card-risk"
        />
        <TodayCard
          kicker={t('today.cards.insight')}
          body={payload.personal_insight}
          testId="today-card-insight"
        />
      </div>

      <p className="today-closing" data-testid="today-closing">
        {payload.closing_line}
      </p>
    </>
  );

  if (variant === 'mobile') {
    return (
      <div className="today-experience today-experience--mobile" data-testid="today-experience">
        {cards}
      </div>
    );
  }

  return (
    <div className="today-experience today-experience--desktop" data-testid="today-experience">
      {cards}
    </div>
  );
}
