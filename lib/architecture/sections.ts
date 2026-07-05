/**
 * Giuseppe OS — product sections.
 * Each section has one purpose and answers one life question.
 */

export type ProductSectionId = 'today' | 'decisions' | 'insights' | 'brands' | 'create' | 'memory';

export interface ProductSection {
  id: ProductSectionId;
  purpose: string;
  question: string;
  engines: string[];
  dataNeeds: string[];
  futureImprovements: string[];
}

export const PRODUCT_MISSION_STATEMENT =
  'Increase the probability that Giuseppe builds the life he truly wants — by improving his judgement, not replacing it.';

export const GLOBAL_PRODUCT_PRINCIPLES = [
  'Less information. More clarity.',
  'Less notifications. More meaning.',
  'Less productivity. More trajectory.',
  'Less quantity. More leverage.',
  "Protect Giuseppe's attention.",
  'Respect uncertainty.',
  'Never pretend certainty.',
  'Always explain reasoning.'
] as const;

export const PRODUCT_SECTIONS: ProductSection[] = [
  {
    id: 'today',
    purpose: 'Guide Giuseppe every morning.',
    question: 'What is the highest leverage thing I can do today?',
    engines: [
      'digital-twin',
      'personal-relevance-engine',
      'reality-engine',
      'trajectory-engine',
      'quality-engine',
      'daily-brief-generator'
    ],
    dataNeeds: [
      'Digital Twin snapshot',
      'Active projects and priorities',
      'Recent behaviour and decisions',
      'World signals (filtered)',
      'Calendar (future)'
    ],
    futureImprovements: [
      'Calendar integration',
      'Confidence and evidence panels from pipeline meta',
      'Regenerate when Quality Engine fails'
    ]
  },
  {
    id: 'decisions',
    purpose: 'Help Giuseppe make better decisions.',
    question: 'What is the best decision I can make?',
    engines: [
      'decision-simulator',
      'goal-validation-engine',
      'trajectory-engine',
      'executive-brain',
      'digital-twin'
    ],
    dataNeeds: [
      'User-submitted decision and reason',
      'Memory constitution and patterns',
      'Financial context (when relevant)',
      'Three Selves framing'
    ],
    futureImprovements: [
      'Multi-scenario simulation before recommendation',
      'Upside, downside, trade-offs, opportunity cost per scenario',
      'Never answer immediately — simulate first'
    ]
  },
  {
    id: 'insights',
    purpose: 'Observe Giuseppe over time — not daily.',
    question: 'What am I not seeing?',
    engines: ['pattern-engine', 'awareness-engine', 'learning-engine', 'digital-twin'],
    dataNeeds: [
      'Projects, writing, creative work',
      'Decisions and habits',
      'Relationships and energy patterns',
      'Living Timeline events (future)'
    ],
    futureImprovements: [
      'Latent pattern discovery from Pattern Engine',
      'Blind spots and behaviour evolution',
      'No daily refresh — compounds over weeks'
    ]
  },
  {
    id: 'brands',
    purpose: 'Show brand and project momentum without exposing financial balances.',
    question: 'How are my brands doing?',
    engines: ['potential-engine', 'trajectory-engine', 'digital-twin'],
    dataNeeds: [
      'Active project roster',
      'Brand momentum signals (non-financial)',
      'Publishing and reputation proxies',
      'Trajectory impact'
    ],
    futureImprovements: [
      'Real signals from writing, LinkedIn, and project activity',
      'Where to invest attention this month',
      'Importance Score and Momentum per brand'
    ]
  },
  {
    id: 'create',
    purpose: 'Creative studio — make anything from brief and references.',
    question: 'What do I want to create?',
    engines: ['content-generator', 'executive-brain', 'digital-twin'],
    dataNeeds: [
      'Creative brief and uploaded references',
      'Identity and Memory context',
      'Output format (text, visual, video)'
    ],
    futureImprovements: [
      'Multimodal generation from references',
      'Video and visual output pipelines',
      'Unified creative lab instead of scattered generators'
    ]
  },
  {
    id: 'memory',
    purpose: "Remind Giuseppe who he is — Giuseppe's Constitution.",
    question: 'Who do I want to continue being?',
    engines: ['identity-layer', 'memory-store'],
    dataNeeds: [
      'Mission, North Star, values, principles',
      'Decision rules, creative and writing DNA',
      'Lessons, blind spots, beliefs, future self'
    ],
    futureImprovements: [
      'AI-suggested updates — only Giuseppe accepts changes',
      'Every engine consults Memory before recommending',
      'Not a database or timeline — identity protection'
    ]
  }
];

export function sectionById(id: ProductSectionId): ProductSection {
  const section = PRODUCT_SECTIONS.find(item => item.id === id);
  if (!section) {
    throw new Error(`Unknown product section: ${id}`);
  }
  return section;
}
