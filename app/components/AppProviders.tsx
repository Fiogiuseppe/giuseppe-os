'use client';

import { LanguageProvider } from '../lib/i18n/LanguageContext';
import { ContentStudioProvider } from '../lib/contentStudio/ContentStudioContext';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <ContentStudioProvider>{children}</ContentStudioProvider>
    </LanguageProvider>
  );
}
