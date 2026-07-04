'use client';

type RegenerateAiButtonProps = {
  loading: boolean;
  onRegenerate: () => void;
};

export function RegenerateAiButton({ loading, onRegenerate }: RegenerateAiButtonProps) {
  return (
    <button
      type="button"
      className="regenerate-ai-button"
      data-testid="regenerate-ai-button"
      onClick={onRegenerate}
      disabled={loading}
    >
      Regenerate AI
    </button>
  );
}
