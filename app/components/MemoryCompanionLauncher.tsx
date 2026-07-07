'use client';

import { useLanguage } from '../lib/i18n/LanguageContext';
import { openIdentityChatWindow } from '../../lib/chat/session-storage';

export function MemoryCompanionLauncher() {
  const { t } = useLanguage();

  return (
    <div className="memory-companion-launcher" data-testid="memory-companion-launcher">
      <p className="memory-companion-launcher-hint">{t('memory.companion.launchHint')}</p>
      <button
        type="button"
        className="insights-action-chip memory-companion-open-button"
        data-testid="memory-companion-open"
        onClick={openIdentityChatWindow}
      >
        {t('memory.companion.openChat')} <span aria-hidden="true">→</span>
      </button>
    </div>
  );
}
