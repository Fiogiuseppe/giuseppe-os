'use client';

import { useLanguage } from '../lib/i18n/LanguageContext';
import { useAiLive } from '../lib/AiLiveContext';

export function AiStatusToggle() {
  const { t } = useLanguage();
  const { aiLive, liveAvailable, ready, toggleAiLive } = useAiLive();

  if (!ready) {
    return (
      <div className="footer-status" aria-hidden="true">
        <span className="status-dot status-dot--off" />
        <span className="footer-status-label">{t('ai.label')}</span>
      </div>
    );
  }

  const isOn = aiLive && liveAvailable;
  const tooltip = isOn ? t('ai.onTooltip') : t('ai.offTooltip');

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
      <span className={`status-dot ${isOn ? 'status-dot--on' : 'status-dot--off'}`} />
      <span className="footer-status-label">{t('ai.label')}</span>
    </button>
  );
}
