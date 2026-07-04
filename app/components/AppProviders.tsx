'use client';

import { LanguageProvider } from '../lib/i18n/LanguageContext';
import { AiLiveProvider } from '../lib/AiLiveContext';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <AiLiveProvider>{children}</AiLiveProvider>
    </LanguageProvider>
  );
}
