'use client';

import { useLanguage } from '../lib/i18n/LanguageContext';
import type { Locale } from '../lib/i18n/types';

export function LanguageSwitch({ className }: { className?: string }) {
  const { locale, setLocale, t } = useLanguage();
  const otherLocale: Locale = locale === 'en' ? 'it' : 'en';
  const otherLabel = otherLocale === 'it' ? t('language.italian') : t('language.english');

  return (
    <div
      className={['language-switch', className].filter(Boolean).join(' ')}
      role="group"
      aria-label={t('language.switchLabel')}
    >
      <button
        type="button"
        className="language-switch-toggle"
        aria-pressed={false}
        onClick={() => setLocale(otherLocale)}
      >
        {otherLabel}
      </button>
    </div>
  );
}
