'use client';

import type { DailyBriefingResponse } from '../../lib/briefing/types';
import { limitWords } from '../../lib/todays-letter/parse';
import { MAX_TODAY_ONE_BIG_MOVE_WORDS } from '../../lib/todays-letter/prompt';
import { useLanguage } from '../lib/i18n/LanguageContext';
import TodayAvatarNav, { type AvatarNavView } from './TodayAvatarNav';

const MAX_RITUAL_INSIGHT_WORDS = 22;
const MAX_RITUAL_REFLECTION_WORDS = 24;

type TodayMobileRitualProps = {
  letterLoading: boolean;
  letterError: string | null;
  todaysLetter: DailyBriefingResponse | null;
  onNavigate: (view: AvatarNavView) => void;
};

export default function TodayMobileRitual({
  letterLoading,
  letterError,
  todaysLetter,
  onNavigate
}: TodayMobileRitualProps) {
  const { t } = useLanguage();

  return (
    <div className="today-ritual" data-testid="today-ritual">
      <div className="today-ritual-date" aria-hidden="true">
        {todaysLetter?.dateKey ?? '—'}
      </div>

      <div className="today-ritual-presence">
        <TodayAvatarNav onNavigate={onNavigate} />
      </div>

      <div className="today-ritual-brief" data-testid="today-ritual-brief">
        {letterLoading && (
          <p className="today-ritual-line today-ritual-line--loading">{t('today.loading')}</p>
        )}

        {!letterLoading && letterError && (
          <p className="today-ritual-line today-ritual-line--error">{letterError}</p>
        )}

        {!letterLoading && !letterError && todaysLetter && (
          <>
            <p className="today-ritual-kicker">{t('today.ritual.insight')}</p>
            <p className="today-ritual-line today-ritual-insight" data-testid="today-ritual-insight">
              {limitWords(todaysLetter.sections.reality, MAX_RITUAL_INSIGHT_WORDS)}
            </p>

            <p className="today-ritual-kicker">{t('today.ritual.action')}</p>
            <p className="today-ritual-line today-ritual-action" data-testid="today-ritual-action">
              {limitWords(todaysLetter.sections.oneBigMove, MAX_TODAY_ONE_BIG_MOVE_WORDS)}
            </p>

            <p className="today-ritual-kicker">{t('today.ritual.reflection')}</p>
            <p
              className="today-ritual-line today-ritual-reflection"
              data-testid="today-ritual-reflection"
            >
              {limitWords(todaysLetter.sections.reflection, MAX_RITUAL_REFLECTION_WORDS)}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
