import type { GiuseppeBrain } from '../types';

export function publicFinanceSnapshot(brain: GiuseppeBrain) {
  const tier = brain.finance.liquidity_tier ?? 'unknown';
  return {
    liquidityTier: tier,
    goals: brain.finance.main_goals,
    incomeNotes: 'redacted'
  };
}
