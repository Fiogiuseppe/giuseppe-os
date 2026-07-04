/**
 * Canonical Decision Intelligence pipeline (v2 target state).
 * Engines marked planned are typed but not yet implemented.
 */

export const DECISION_INTELLIGENCE_PIPELINE = [
  'living-timeline',
  'reality-engine',
  'personal-relevance-engine',
  'identity-layer',
  'digital-twin',
  'pattern-engine',
  'voice-dna',
  'goal-validation-engine',
  'trajectory-engine',
  'decision-simulator',
  'prediction-engine',
  'quality-engine',
  'daily-brief-generator',
  'learning-engine'
] as const;

export type PipelineEngineId = (typeof DECISION_INTELLIGENCE_PIPELINE)[number];

export const IMPLEMENTED_PIPELINE_ENGINES: PipelineEngineId[] = [
  'reality-engine',
  'personal-relevance-engine',
  'trajectory-engine',
  'quality-engine',
  'daily-brief-generator'
];

export const FOUNDATION_PIPELINE_ENGINES: PipelineEngineId[] = [
  'living-timeline',
  'identity-layer',
  'digital-twin',
  'pattern-engine',
  'voice-dna',
  'goal-validation-engine',
  'decision-simulator',
  'prediction-engine',
  'learning-engine'
];

export const ULTIMATE_PURPOSE =
  'Giuseppe OS is not trying to become the smartest AI. It is trying to become the decision partner Giuseppe trusts the most.';

export const SUCCESS_METRIC =
  'Success is measured by whether Giuseppe consistently makes better life decisions over time — not by usage.';

export const DECISION_PARTNER_PRINCIPLE =
  'Giuseppe OS behaves like the advisor Giuseppe would choose before any important decision — not because it is always right, but because it understands who he has been, who he is today, who he wants to become, current reality, possible futures, trade-offs, uncertainty, risks, and opportunities. The system never replaces Giuseppe. It improves his judgement.';

export const PRIMARY_PRODUCT_QUESTION =
  'Knowing everything Giuseppe has lived, everything happening in the world, and everything he wants to become — what decision has the highest probability of improving his future?';

export const DAILY_BRIEF_QUESTION =
  'What is the highest leverage thing I can do today?';

export const GOLDEN_RULE_QUESTION =
  'If Giuseppe follows this advice, will Future Giuseppe most likely thank Present Giuseppe ten years from now?';

export const GOLDEN_RULE =
  'If yes — show it. If not — keep silent.';

export const PATTERN_DETECTION_PRINCIPLE =
  'Discover patterns Giuseppe cannot easily notice himself. Patterns are more valuable than memories. The objective is not to know Giuseppe better than Giuseppe — but to surface what is hard to see from inside.';

export const THREE_SELVES_FRAMEWORK = {
  past: {
    label: 'Past Giuseppe',
    questions: [
      'What has Giuseppe already experienced?',
      'Which patterns repeat?',
      'Which mistakes should not repeat?',
      'Which successes should compound?'
    ]
  },
  present: {
    label: 'Present Giuseppe',
    questions: [
      'What is happening today?',
      'Current energy, projects, finances, relationships, responsibilities, opportunities, and risks.'
    ]
  },
  future: {
    label: 'Future Giuseppe',
    questions: [
      'Who does Giuseppe want to become?',
      'Creative Director. Builder. Writer. Financially free. Healthy. Present father. Great friend. Extraordinary human being.'
    ]
  }
} as const;

export const THREE_SELVES_RULE =
  'Every recommendation must maximize alignment between Present Giuseppe and Future Giuseppe while respecting everything learned by Past Giuseppe.';
