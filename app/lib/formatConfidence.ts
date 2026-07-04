
export function formatConfidenceDisplay(
  t: (key: string) => string,
  score: number | null,
  label: 'learning' | 'notEnoughData' | 'score'
): string {
  if (label === 'score' && score !== null) {
    return String(score);
  }
  return t(`confidence.${label}`);
}

export function formatProgressDisplay(t: (key: string) => string): string {
  return t('confidence.notEnoughData');
}
