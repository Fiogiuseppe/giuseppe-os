'use client';

import type { TodayResponse } from '../../lib/today/types';
import { useLanguage } from '../lib/i18n/LanguageContext';
import TodayAvatarNav, { type AvatarNavView } from './TodayAvatarNav';
import { TodayExperience } from './TodayExperience';

type TodayMobileShellProps = {
  todayLoading: boolean;
  todayError: string | null;
  today: TodayResponse | null;
  onNavigate: (view: AvatarNavView) => void;
  onOpenDecisions?: () => void;
};

export default function TodayMobileShell({
  todayLoading,
  todayError,
  today,
  onNavigate,
  onOpenDecisions
}: TodayMobileShellProps) {
  const { t } = useLanguage();

  return (
    <div className="today-ritual" data-testid="today-ritual">
      <div className="today-ritual-date" aria-hidden="true">
        {today?.dateKey ?? '—'}
      </div>

      <div className="today-ritual-presence">
        <TodayAvatarNav onNavigate={onNavigate} />
      </div>

      <div className="today-ritual-brief" data-testid="today-ritual-brief">
        {todayLoading && (
          <p className="today-ritual-line today-ritual-line--loading">{t('today.loading')}</p>
        )}

        {!todayLoading && todayError && (
          <p className="today-ritual-line today-ritual-line--error">{todayError}</p>
        )}

        {!todayLoading && !todayError && today && (
          <TodayExperience today={today} onOpenDecisions={onOpenDecisions} variant="mobile" />
        )}
      </div>
    </div>
  );
}
