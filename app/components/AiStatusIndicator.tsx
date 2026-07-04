'use client';

import { useLanguage } from '../lib/i18n/LanguageContext';

export function AiStatusIndicator() {
  const { t } = useLanguage();
  const tooltip = t('ai.offTooltip');

  return (
    <div
      className="footer-status footer-ai-status--locked"
      data-testid="ai-status-indicator"
      aria-label={tooltip}
      title={tooltip}
    >
      <span className="status-dot status-dot--off" />
      <span className="footer-status-label">{t('ai.label')}</span>
    </div>
  );
}
