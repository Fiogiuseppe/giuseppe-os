'use client';

import { RegenerateAiButton } from './RegenerateAiButton';

type DevAiControlsProps = {
  letterLoading: boolean;
  onRegenerate: () => void;
};

export function DevAiControls({ letterLoading, onRegenerate }: DevAiControlsProps) {
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="dev-ai-controls" data-testid="dev-ai-controls">
      <RegenerateAiButton loading={letterLoading} onRegenerate={onRegenerate} />
    </div>
  );
}
