import { loadBrain, loadLongTermMemory } from '../brain/memory/store';
import type { GiuseppeBrain, LongTermMemory } from '../brain/types';
import type { PersonalRelevanceItem, PersonalRelevanceReport } from '../relevance/types';
import type { RealityReport } from '../reality/types';
import { TEN_YEAR_QUESTION, TRAJECTORY_QUESTION } from '../philosophy/core';
import type { TrajectoryDirection, TrajectoryEvaluation, TrajectoryReport } from './types';

export interface TrajectoryContext {
  constitution: string;
  mission: string;
  northStar: string;
  values: string[];
  patterns: string[];
  priorities: string[];
  creativeGoals: string[];
  careerGoals: string[];
  financeGoals: string[];
  brain: GiuseppeBrain;
  longTerm: LongTermMemory;
  reality: RealityReport;
  relevance: PersonalRelevanceReport;
}

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

function includesAny(text: string, terms: string[]): boolean {
  const lower = text.toLowerCase();
  return terms.some(term => lower.includes(term.toLowerCase()));
}

function evaluateRecommendation(
  id: string,
  recommendation: string,
  context: TrajectoryContext,
  requireApproval: boolean
): TrajectoryEvaluation {
  const text = recommendation.toLowerCase();
  let direction: TrajectoryDirection = 'unclear';
  let score = 0;
  const rationales: string[] = [];

  if (STRENGTHENS_PATTERNS.some(pattern => pattern.test(text))) {
    score += 2;
    rationales.push('allinea segnali di leva a lungo termine');
  }

  if (WEAKENS_PATTERNS.some(pattern => pattern.test(text))) {
    score -= 3;
    rationales.push('rischia di deviare la traiettoria');
  }

  if (includesAny(text, [context.mission, context.northStar])) {
    score += 2;
    rationales.push('serve missione e North Star');
  }

  if (includesAny(text, context.priorities)) {
    score += 2;
    rationales.push('collegato alle priorità documentate');
  }

  if (includesAny(text, context.patterns.filter(p => /dispersione|troppi progetti/i.test(p)))) {
    score -= 2;
    rationales.push('tocca il rischio di dispersione');
  }

  if (includesAny(text, context.values)) {
    score += 1;
  }

  if (includesAny(text, context.creativeGoals)) {
    score += 1;
    rationales.push('supporta obiettivi creativi');
  }

  if (/casa|house|mutuo|mortgage/i.test(text) && !/libert|freedom|runway/i.test(text)) {
    score -= 3;
    rationales.push('violazione house rule: libertà prima della casa');
  }

  if (score >= 2) {
    direction = 'strengthens';
  } else if (score <= -2) {
    direction = 'weakens';
  }

  const confidence: TrajectoryEvaluation['confidence'] =
    direction === 'strengthens' && score >= 3
      ? 'high'
      : direction === 'strengthens' || (direction === 'unclear' && score >= 0)
        ? 'medium'
        : 'low';

  const tenYearGratitude: TrajectoryEvaluation['tenYearGratitude'] =
    direction === 'strengthens' && confidence !== 'low'
      ? true
      : direction === 'weakens'
        ? false
        : 'unclear';

  const approved =
    direction === 'weakens'
      ? false
      : requireApproval
        ? direction === 'strengthens' || (direction === 'unclear' && confidence !== 'low')
        : true;

  return {
    id,
    recommendation,
    direction,
    confidence,
    tenYearGratitude,
    rationale:
      rationales.length > 0
        ? rationales.join('; ')
        : direction === 'unclear'
          ? 'impatto sulla traiettoria non chiaro'
          : 'valutazione traiettoria completata',
    approved
  };
}

export function evaluateTrajectoryRecommendations(
  recommendations: Array<{ id: string; text: string; requireApproval?: boolean }>,
  context: TrajectoryContext
): TrajectoryEvaluation[] {
  return recommendations.map(item =>
    evaluateRecommendation(item.id, item.text, context, item.requireApproval ?? true)
  );
}

export async function runTrajectoryEngine(
  input: Omit<TrajectoryContext, 'brain' | 'longTerm'>
): Promise<TrajectoryReport> {
  const brain = await loadBrain();
  const longTerm = await loadLongTermMemory();
  const context: TrajectoryContext = { ...input, brain, longTerm };

  const candidates = context.relevance.items.map(item => ({
    id: item.id,
    text: `${item.headline} — ${item.whyForGiuseppe}`,
    requireApproval: true
  }));

  const evaluations = evaluateTrajectoryRecommendations(candidates, context);
  const approvedCount = evaluations.filter(item => item.approved).length;
  const filteredCount = evaluations.length - approvedCount;

  return {
    generatedAt: new Date().toISOString(),
    trajectoryQuestion: TRAJECTORY_QUESTION,
    tenYearQuestion: TEN_YEAR_QUESTION,
    evaluations,
    approvedCount,
    filteredCount,
    trajectoryNote:
      filteredCount > 0
        ? `Trajectory Engine ha filtrato ${filteredCount} raccomandazioni che non rafforzano la visione a 10 anni.`
        : 'Tutte le raccomandazioni candidate rafforzano o mantengono la traiettoria.'
  };
}

export function filterRelevanceByTrajectory(
  items: PersonalRelevanceItem[],
  report: TrajectoryReport
): PersonalRelevanceItem[] {
  const approvedIds = new Set(
    report.evaluations.filter(evaluation => evaluation.approved).map(evaluation => evaluation.id)
  );
  return items.filter(item => approvedIds.has(item.id));
}
