'use client';

import { useMemo, useState } from 'react';
import type { WeeklyBoardResponse } from '../../lib/weekly-board/types';
import { formatWeekLabel } from '../../lib/weekly-board/cache';
import { useLanguage } from '../lib/i18n/LanguageContext';
import { DisclosurePanel, DisclosureTrigger } from './Disclosure';

type WeeklyBoardSection = 'priorities' | 'doNotDo' | 'trajectory' | null;

type WeeklyBoardCardProps = {
  board: WeeklyBoardResponse;
  onDismiss: () => void;
};

export function WeeklyBoardCard({ board, onDismiss }: WeeklyBoardCardProps) {
  const { t, locale } = useLanguage();
  const [openSection, setOpenSection] = useState<WeeklyBoardSection>(null);

  const weekLabel = useMemo(
    () => formatWeekLabel(board.weekKey, locale),
    [board.weekKey, locale]
  );

  return (
    <section className="weekly-board-card" aria-label={t('weeklyBoard.title')}>
      <div className="weekly-board-header">
        <div>
          <div className="kicker">{t('weeklyBoard.kicker')}</div>
          <h2 className="weekly-board-title">{t('weeklyBoard.title')}</h2>
          <p className="weekly-board-week">{weekLabel}</p>
        </div>
        <button type="button" className="weekly-board-dismiss" onClick={onDismiss}>
          {t('weeklyBoard.dismiss')}
        </button>
      </div>

      {openSection === null ? (
        <>
          <p className="weekly-board-challenge">{board.challenge}</p>
          <div className="discovery-trail weekly-board-trail">
            <DisclosureTrigger
              label={t('weeklyBoard.priorities')}
              onClick={() => setOpenSection('priorities')}
            />
            <DisclosureTrigger
              label={t('weeklyBoard.doNotDo')}
              onClick={() => setOpenSection('doNotDo')}
            />
            <DisclosureTrigger
              label={t('weeklyBoard.trajectory')}
              onClick={() => setOpenSection('trajectory')}
            />
          </div>
        </>
      ) : (
        <>
          <button type="button" className="reading-expand-close" onClick={() => setOpenSection(null)}>
            <span aria-hidden="true">←</span> {t('disclosure.closeReading')}
          </button>
          <DisclosurePanel open={openSection === 'priorities'}>
            <div className="kicker">{t('weeklyBoard.priorities')}</div>
            <ul className="weekly-board-list">
              {board.priorities.map(item => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </DisclosurePanel>
          <DisclosurePanel open={openSection === 'doNotDo'}>
            <div className="kicker">{t('weeklyBoard.doNotDo')}</div>
            <ul className="weekly-board-list">
              {board.doNotDo.map(item => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </DisclosurePanel>
          <DisclosurePanel open={openSection === 'trajectory'}>
            <div className="kicker">{t('weeklyBoard.trajectory')}</div>
            <p className="weekly-board-trajectory">{board.trajectoryCheck}</p>
          </DisclosurePanel>
          <div className="discovery-trail weekly-board-trail">
            {openSection !== 'priorities' && (
              <DisclosureTrigger
                label={t('weeklyBoard.priorities')}
                onClick={() => setOpenSection('priorities')}
              />
            )}
            {openSection !== 'doNotDo' && (
              <DisclosureTrigger
                label={t('weeklyBoard.doNotDo')}
                onClick={() => setOpenSection('doNotDo')}
              />
            )}
            {openSection !== 'trajectory' && (
              <DisclosureTrigger
                label={t('weeklyBoard.trajectory')}
                onClick={() => setOpenSection('trajectory')}
              />
            )}
          </div>
        </>
      )}
    </section>
  );
}

export function isWeeklyBoardDismissed(weekKey: string): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  return window.localStorage.getItem(`weekly-board-dismissed-${weekKey}`) === '1';
}

export function dismissWeeklyBoard(weekKey: string): void {
  window.localStorage.setItem(`weekly-board-dismissed-${weekKey}`, '1');
}
