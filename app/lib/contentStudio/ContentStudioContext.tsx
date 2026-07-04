'use client';

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type { ContentSourceType } from '../../../lib/content/types';

export type ContentStudioConfig = {
  sourceType: ContentSourceType;
  sourceId?: string;
  topic?: string;
};

type ContentStudioContextValue = {
  isOpen: boolean;
  config: ContentStudioConfig;
  open: (config?: Partial<ContentStudioConfig>) => void;
  close: () => void;
};

const DEFAULT_CONFIG: ContentStudioConfig = {
  sourceType: 'freeform'
};

const ContentStudioContext = createContext<ContentStudioContextValue | null>(null);

export function ContentStudioProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<ContentStudioConfig>(DEFAULT_CONFIG);

  const open = useCallback((next?: Partial<ContentStudioConfig>) => {
    setConfig({
      ...DEFAULT_CONFIG,
      ...next
    });
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const value = useMemo(
    () => ({
      isOpen,
      config,
      open,
      close
    }),
    [isOpen, config, open, close]
  );

  return <ContentStudioContext.Provider value={value}>{children}</ContentStudioContext.Provider>;
}

export function useContentStudio(): ContentStudioContextValue {
  const context = useContext(ContentStudioContext);
  if (!context) {
    throw new Error('useContentStudio must be used within ContentStudioProvider');
  }
  return context;
}
