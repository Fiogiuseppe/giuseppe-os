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
  clientToggleEnabled: boolean;
  ready: boolean;
  toggleAiLive: () => void;
};

const AiLiveContext = createContext<AiLiveContextValue | null>(null);

export function AiLiveProvider({ children }: { children: ReactNode }) {
  const [aiLive, setAiLive] = useState(false);
  const [liveAvailable, setLiveAvailable] = useState(false);
  const [clientToggleEnabled, setClientToggleEnabled] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function initialize() {
      const response = await fetch('/api/ai-status');
      const body = response.ok
        ? ((await response.json()) as {
            liveAvailable?: boolean;
            clientToggleEnabled?: boolean;
          })
        : { liveAvailable: false, clientToggleEnabled: false };

      if (cancelled) {
        return;
      }

      const toggleEnabled = Boolean(body.clientToggleEnabled);
      const available = Boolean(body.liveAvailable);
      const stored = toggleEnabled ? readAiLivePreference() : false;

      if (!toggleEnabled || (stored && !available)) {
        writeAiLivePreference(false);
      }

      setClientToggleEnabled(toggleEnabled);
      setLiveAvailable(available);
      setAiLive(stored && available);
      setReady(true);
    }

    void initialize();

    return () => {
      cancelled = true;
    };
  }, []);

  const toggleAiLive = useCallback(() => {
    if (!clientToggleEnabled) {
      return;
    }

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
  }, [clientToggleEnabled, liveAvailable]);

  const value = useMemo(
    () => ({
      aiLive,
      liveAvailable,
      clientToggleEnabled,
      ready,
      toggleAiLive
    }),
    [aiLive, liveAvailable, clientToggleEnabled, ready, toggleAiLive]
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
