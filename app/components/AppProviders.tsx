'use client';

import { LanguageProvider } from '../lib/i18n/LanguageContext';
import { LanguageSwitch } from './LanguageSwitch';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      {children}
      <LanguageSwitch />
    </LanguageProvider>
  );
}
