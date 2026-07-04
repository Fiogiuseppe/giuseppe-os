'use client';

import { LanguageProvider } from '../lib/i18n/LanguageContext';
import { ContentStudioProvider } from '../lib/contentStudio/ContentStudioContext';
import { GlobalContentStudio } from './GlobalContentStudio';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <ContentStudioProvider>
        {children}
        <GlobalContentStudio />
      </ContentStudioProvider>
    </LanguageProvider>
  );
}
