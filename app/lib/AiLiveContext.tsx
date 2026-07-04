'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from 'react';
import { readAiLivePreference, writeAiLivePreference } from './aiLive';

type AiLiveContextValue = {
  aiLive: boolean;
  liveAvailable: boolean;
  ready: boolean;
  toggleAiLive: () => void;
};

const AiLiveContext = createContext<AiLiveContextValue | null>(null);

export function AiLiveProvider({ children }: { children: ReactNode }) {
  const [aiLive, setAiLive] = useState(false);
  const [liveAvailable, setLiveAvailable] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function initialize() {
      const stored = readAiLivePreference();

      const response = await fetch('/api/ai-status');
      const body = response.ok
        ? ((await response.json()) as { liveAvailable?: boolean })
        : { liveAvailable: false };

      if (cancelled) {
        return;
      }

      const available = Boolean(body.liveAvailable);
      const effective = stored && available;

      if (stored && !available) {
        writeAiLivePreference(false);
      }

      setLiveAvailable(available);
      setAiLive(effective);
      setReady(true);
    }

    void initialize();

    return () => {
      cancelled = true;
    };
  }, []);

  const toggleAiLive = useCallback(() => {
    setAiLive(current => {
      if (current) {
        writeAiLivePreference(false);
        return false;
      }

      if (!liveAvailable) {
        return false;
      }

      writeAiLivePreference(true);
      return true;
    });
  }, [liveAvailable]);

  const value = useMemo(
    () => ({
      aiLive,
      liveAvailable,
      ready,
      toggleAiLive
    }),
    [aiLive, liveAvailable, ready, toggleAiLive]
  );

  return <AiLiveContext.Provider value={value}>{children}</AiLiveContext.Provider>;
}

export function useAiLive(): AiLiveContextValue {
  const context = useContext(AiLiveContext);
  if (!context) {
    throw new Error('useAiLive must be used within AiLiveProvider');
  }
  return context;
}
