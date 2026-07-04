'use client';

import { useLanguage } from '../lib/i18n/LanguageContext';

const PERSONAL_SITE_URL = 'https://fiogiuseppe.com';

export function FooterCredit() {
  const { t } = useLanguage();

  return (
    <p className="footer-credit" data-testid="footer-credit">
      {t('footer.designedFor')}{' '}
      <a href={PERSONAL_SITE_URL} target="_blank" rel="noopener noreferrer">
        {t('footer.designerName')}
      </a>
    </p>
  );
}
