'use client';

import { useLanguage } from '../lib/i18n/LanguageContext';

export function LanguageSwitch({ className }: { className?: string }) {
  const { locale, setLocale, t } = useLanguage();

  return (
    <div
      className={['language-switch', className].filter(Boolean).join(' ')}
      role="group"
      aria-label={t('language.switchLabel')}
    >
      <button
        type="button"
        className={`language-switch-option${locale === 'it' ? ' language-switch-option--active' : ''}`}
        aria-pressed={locale === 'it'}
        onClick={() => setLocale('it')}
      >
        {t('language.italian')}
      </button>
      <span className="language-switch-sep" aria-hidden="true">
        /
      </span>
      <button
        type="button"
        className={`language-switch-option${locale === 'en' ? ' language-switch-option--active' : ''}`}
        aria-pressed={locale === 'en'}
        onClick={() => setLocale('en')}
      >
        {t('language.english')}
      </button>
    </div>
  );
}
