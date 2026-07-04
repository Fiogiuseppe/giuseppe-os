'use client';

import { useLanguage } from '../lib/i18n/LanguageContext';
import { useAiLive } from '../lib/AiLiveContext';

export function AiStatusToggle() {
  const { t } = useLanguage();
  const { aiLive, liveAvailable, clientToggleEnabled, ready, toggleAiLive } = useAiLive();

  if (!ready) {
    return (
      <div className="footer-status" aria-hidden="true">
        <span className="status-dot status-dot--off" />
        <span className="footer-status-label">{t('ai.label')}</span>
      </div>
    );
  }

  const isOn = aiLive && liveAvailable;
  const tooltip = !clientToggleEnabled
    ? t('ai.lockedTooltip')
    : isOn
      ? t('ai.onTooltip')
      : t('ai.offTooltip');

  const content = (
    <>
      <span className={`status-dot ${isOn ? 'status-dot--on' : 'status-dot--off'}`} />
      <span className="footer-status-label">{t('ai.label')}</span>
    </>
  );

  if (!clientToggleEnabled) {
    return (
      <div
        className="footer-status footer-ai-status--locked"
        data-testid="ai-status-toggle"
        aria-label={tooltip}
        title={tooltip}
      >
        {content}
      </div>
    );
  }

  return (
    <button
      type="button"
      className="footer-status footer-ai-toggle"
      data-testid="ai-status-toggle"
      aria-pressed={isOn}
      aria-label={tooltip}
      title={tooltip}
      onClick={toggleAiLive}
    >
      {content}
    </button>
  );
}
