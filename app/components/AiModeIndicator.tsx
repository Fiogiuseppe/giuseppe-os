'use client';

import { useEffect, useState } from 'react';

type AiStatus = {
  showIndicator: boolean;
  mode?: 'mock' | 'live';
};

export function AiModeIndicator() {
  const [status, setStatus] = useState<AiStatus | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadStatus() {
      const response = await fetch('/api/ai-status');
      if (!response.ok || cancelled) {
        return;
      }

      const body = (await response.json()) as AiStatus;
      if (!cancelled) {
        setStatus(body);
      }
    }

    void loadStatus();

    return () => {
      cancelled = true;
    };
  }, []);

  if (!status?.showIndicator || !status.mode) {
    return null;
  }

  return (
    <span className={`ai-mode-indicator ai-mode-indicator--${status.mode}`} data-testid="ai-mode-indicator">
      AI: {status.mode.toUpperCase()}
    </span>
  );
}
