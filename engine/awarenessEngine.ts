import brain from '../memory/giuseppe_brain.json';
import {
  assessEvidence,
  confidenceFromEvidence,
  formatObservationHeadline,
  type EvidenceLevel
} from '../lib/memory/evidence';
import type { LongTermMemory, WorkingMemory } from '../lib/brain/types';
import { buildDecisionHistory, buildEvidenceSnapshot } from '../lib/memory/insights';
import { buildAwarenessCandidates } from './content/awarenessCandidates';

export type DecisionRecord = {
  decision: string;
  reason: string;
  category?: string;
};

export type AwarenessInsight = {
  headline: string;
  insight: string;
  whyItMatters: string;
  evidence: string[];
  riskIfIgnored: string;
  reflectionQuestion: string;
  recommendedAction: string;
  confidenceScore: number | null;
  confidenceLabel: 'learning' | 'notEnoughData' | 'score';
  hasEnoughData: boolean;
  evidenceLevel: EvidenceLevel;
  signalType: 'pattern' | 'contradiction' | 'opportunity' | 'risk';
  proactive: boolean;
  recurringPattern: boolean;
};

type BrainProject = {
  role: string;
  status: string;
};

type GiuseppeBrain = {
  north_star: string;
  mission_2036: string;
  manifesto: string;
  values: string[];
  rules: string[];
  projects: Record<string, BrainProject>;
  finance: {
    cash_dkk: number;
    liquidity_tier?: string;
    monthly_income_notes: string;
    main_goals: string[];
  };
  patterns: string[];
  skills: string[];
  priorities: string[];
  creative_goals: string[];
  career_goals: string[];
  reading_queue: string[];
  contacts: string[];
};

const memory = brain as GiuseppeBrain;

function countProjectsByStatus(status: string): number {
  return Object.values(memory.projects).filter(project => project.status === status).length;
}

function activeProjectNames(): string[] {
  return Object.entries(memory.projects)
    .filter(([, project]) => project.status === 'active')
    .map(([name]) => name);
}

function slowActiveProjectNames(): string[] {
  return Object.entries(memory.projects)
    .filter(([, project]) => project.status === 'slow-active')
    .map(([name]) => name);
}

function buildCandidates(history: DecisionRecord[], longTerm: LongTermMemory, locale: 'it' | 'en') {
  const activeCount = countProjectsByStatus('active');
  const slowActive = slowActiveProjectNames();
  const activeNames = activeProjectNames();
  return buildAwarenessCandidates(locale, history, longTerm, activeCount, slowActive, activeNames);
}

export type AwarenessEngineInput = {
  decisionHistory?: DecisionRecord[];
  proactive?: boolean;
  longTerm?: LongTermMemory;
  working?: WorkingMemory;
  locale?: 'it' | 'en';
  selfModelPatterns?: string[];
};

export function runAwarenessEngine(input: AwarenessEngineInput = {}): AwarenessInsight {
  const longTerm = input.longTerm ?? { decisions: [], lessons: [], patterns_detected: [], insight_history: [] };
  const working = input.working ?? { sessions: [], notes: [], records: [] };
  const history = input.decisionHistory ?? buildDecisionHistory(longTerm);
  const evidenceSnapshot = buildEvidenceSnapshot(longTerm, working);
  const assessment = assessEvidence(evidenceSnapshot);

  const ranked = buildCandidates(history, longTerm, input.locale ?? 'it')
    .map(candidate => {
      const patternBoost = (input.selfModelPatterns ?? []).some(pattern => {
        const normalizedPattern = pattern.toLowerCase();
        const normalizedInsight = candidate.insight.toLowerCase();
        return (
          normalizedInsight.includes(normalizedPattern.slice(0, 24)) ||
          normalizedPattern.includes(normalizedInsight.slice(0, 24))
        );
      });

      return {
        ...candidate,
        weight: candidate.weight + (patternBoost ? 1.5 : 0)
      };
    })
    .sort((a, b) => b.weight - a.weight);
  const top = ranked[0];
  const recurringPattern = (longTerm.insight_history ?? []).some(entry => entry.insightId === top.id);
  const confidence = confidenceFromEvidence(assessment, top.confidenceSignals);

  return {
    headline: formatObservationHeadline(assessment.observationWindow, input.locale ?? 'it'),
    insight: top.insight,
    whyItMatters: top.whyItMatters,
    evidence: top.evidence,
    riskIfIgnored: top.riskIfIgnored,
    reflectionQuestion: top.reflectionQuestion,
    recommendedAction: top.recommendedAction,
    confidenceScore: confidence.value,
    confidenceLabel: confidence.labelKey,
    hasEnoughData: assessment.hasEnoughForInsights,
    evidenceLevel: assessment.level,
    signalType: top.signalType,
    proactive: input.proactive ?? false,
    recurringPattern
  };
}
