'use client';

import Link from 'next/link';
import { LanguageSwitch } from './LanguageSwitch';
import { useLanguage } from '../lib/i18n/LanguageContext';
import { APP_VIEWS, type AppView } from '../lib/views';

type AppTopbarProps =
  | {
      mode: 'spa';
      activeView: AppView;
      onNavigate: (view: AppView) => void;
    }
  | {
      mode: 'link';
    };

export function AppTopbar(props: AppTopbarProps) {
  const { t } = useLanguage();

  return (
    <header className="topbar">
      <Link href="/" className="topbar-brand" aria-label={t('aria.home')}>
        <img
          src="/images/giuseppe-logo.png"
          alt=""
          className="brand-logo"
          width={300}
          height={87}
          draggable={false}
        />
      </Link>
      <nav className="topnav" aria-label={t('aria.mainNav')}>
        {APP_VIEWS.map(id => {
          if (props.mode === 'spa') {
            return (
              <button
                key={id}
                type="button"
                data-testid={`nav-${id}`}
                className={props.activeView === id ? 'active' : undefined}
                onClick={() => props.onNavigate(id)}
              >
                {t(`nav.${id}`)}
              </button>
            );
          }

          return (
            <Link key={id} href={`/#${id}`} data-testid={`nav-${id}`}>
              {t(`nav.${id}`)}
            </Link>
          );
        })}
      </nav>
      <LanguageSwitch className="language-switch-topbar" />
    </header>
  );
}
