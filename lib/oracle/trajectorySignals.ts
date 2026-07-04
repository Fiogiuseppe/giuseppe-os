const WEAKENS_PATTERNS = [
  /status/i,
  /entertainment/i,
  /netflix/i,
  /scrolling/i,
  /busy work/i,
  /urgenza.{0,12}senza/i,
  /nuov[oi] progett/i,
  /perfezion/i,
  /casa.{0,12}senza.{0,12}libert/i,
  /mutuo.{0,12}senza/i
];

const STRENGTHENS_PATTERNS = [
  /libert/i,
  /2036/i,
  /north star/i,
  /concentra/i,
  /pubblica/i,
  /compound/i,
  /ownership/i,
  /visceral/i,
  /priorit/i,
  /invest/i,
  /reputaz/i,
  /creare/i,
  /profond/i,
  /deep work/i,
  /compounding/i
];

export function textWeakensTrajectory(text: string): boolean {
  const lower = text.toLowerCase();
  return WEAKENS_PATTERNS.some(pattern => pattern.test(lower));
}

export function textStrengthensTrajectory(text: string): boolean {
  const lower = text.toLowerCase();
  return STRENGTHENS_PATTERNS.some(pattern => pattern.test(lower));
}
