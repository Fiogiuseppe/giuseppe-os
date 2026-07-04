'use client';

import { useLanguage } from '../lib/i18n/LanguageContext';

export function LanguageSwitch({ className }: { className?: string }) {
  const { locale, setLocale, t } = useLanguage();
  const isEnglish = locale === 'en';

  return (
    <div
      className={['language-switch', className].filter(Boolean).join(' ')}
      role="group"
      aria-label={t('language.switchLabel')}
    >
      <span className={`language-switch-label${isEnglish ? '' : ' language-switch-label--active'}`}>
        {t('language.italian')}
      </span>
      <button
        type="button"
        className="language-switch-track"
        data-locale={locale}
        role="switch"
        aria-checked={isEnglish}
        aria-label={t('language.switchLabel')}
        onClick={() => setLocale(isEnglish ? 'it' : 'en')}
      >
        <span className="language-switch-knob" />
      </button>
      <span className={`language-switch-label${isEnglish ? ' language-switch-label--active' : ''}`}>
        {t('language.english')}
      </span>
    </div>
  );
}
