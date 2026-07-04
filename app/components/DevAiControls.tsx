'use client';

import { useEffect, useState } from 'react';
import { RegenerateAiButton } from './RegenerateAiButton';

type DevAiControlsProps = {
  letterLoading: boolean;
  onRegenerate: () => void;
};

export function DevAiControls({ letterLoading, onRegenerate }: DevAiControlsProps) {
  const [liveEnabled, setLiveEnabled] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadStatus() {
      const response = await fetch('/api/ai-status');
      if (!response.ok || cancelled) {
        return;
      }

      const body = (await response.json()) as { mode?: string };
      if (!cancelled) {
        setLiveEnabled(body.mode === 'live');
      }
    }

    void loadStatus();

    return () => {
      cancelled = true;
    };
  }, []);

  if (process.env.NODE_ENV !== 'development' || !liveEnabled) {
    return null;
  }

  return (
    <div className="dev-ai-controls" data-testid="dev-ai-controls">
      <RegenerateAiButton loading={letterLoading} onRegenerate={onRegenerate} />
    </div>
  );
}
