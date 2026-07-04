'use client';

import { useEffect, useState } from 'react';
import { AiModeIndicator } from './AiModeIndicator';
import { RegenerateAiButton } from './RegenerateAiButton';

type DevAiControlsProps = {
  letterLoading: boolean;
  onRegenerate: () => void;
};

export function DevAiControls({ letterLoading, onRegenerate }: DevAiControlsProps) {
  const [showControls, setShowControls] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadStatus() {
      const response = await fetch('/api/ai-status');
      if (!response.ok || cancelled) {
        return;
      }

      const body = (await response.json()) as { showIndicator?: boolean };
      if (!cancelled) {
        setShowControls(Boolean(body.showIndicator));
      }
    }

    void loadStatus();

    return () => {
      cancelled = true;
    };
  }, []);

  if (!showControls) {
    return null;
  }

  return (
    <div className="dev-ai-controls" data-testid="dev-ai-controls">
      <AiModeIndicator />
      <RegenerateAiButton loading={letterLoading} onRegenerate={onRegenerate} />
    </div>
  );
}
