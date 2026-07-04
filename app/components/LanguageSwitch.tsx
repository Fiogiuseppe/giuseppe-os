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
      <div className={`language-switch-track${locale === 'it' ? ' language-switch-track--it' : ''}`}>
        <span className="language-switch-knob" aria-hidden="true" />
        <button
          type="button"
          className={`language-switch-option${locale === 'en' ? ' language-switch-option--active' : ''}`}
          aria-pressed={locale === 'en'}
          onClick={() => setLocale('en')}
        >
          {t('language.english')}
        </button>
        <button
          type="button"
          className={`language-switch-option${locale === 'it' ? ' language-switch-option--active' : ''}`}
          aria-pressed={locale === 'it'}
          onClick={() => setLocale('it')}
        >
          {t('language.italian')}
        </button>
      </div>
    </div>
  );
}
