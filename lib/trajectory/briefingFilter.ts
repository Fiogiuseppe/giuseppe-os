import type { DailyBriefingContext, DailyBriefingSections } from '../briefing/types';
import type { GiuseppeBrain, LongTermMemory } from '../brain/types';
import { evaluateTrajectoryRecommendations } from './engine';
import type { TrajectoryContext } from './engine';

function trajectoryContextFromBriefing(
  context: DailyBriefingContext,
  brain: GiuseppeBrain,
  longTerm: LongTermMemory
): TrajectoryContext {
  return {
    constitution: context.constitution,
    mission: context.mission,
    northStar: context.northStar,
    values: context.values,
    patterns: context.patterns,
    priorities: context.priorities,
    creativeGoals: context.creativeGoals,
    careerGoals: context.careerGoals,
    financeGoals: context.financeGoals,
    brain,
    longTerm,
    reality: context.reality,
    relevance: context.relevance
  };
}

export function applyTrajectoryToBriefing(
  sections: DailyBriefingSections,
  context: DailyBriefingContext,
  brain: GiuseppeBrain,
  longTerm: LongTermMemory
): DailyBriefingSections {
  const trajectoryContext = trajectoryContextFromBriefing(context, brain, longTerm);
  const checks = evaluateTrajectoryRecommendations(
    [
      { id: 'oneBigMove', text: sections.oneBigMove },
      { id: 'opportunity', text: sections.opportunity },
      { id: 'nourish', text: sections.nourish }
    ],
    trajectoryContext
  );

  const approved = new Map(checks.map(check => [check.id, check.approved]));
  const fallbackMove = context.priorities[0] ?? context.relevance.items[0]?.headline;

  return {
    ...sections,
    oneBigMove: approved.get('oneBigMove')
      ? sections.oneBigMove
      : fallbackMove ?? 'Informazione mancante: nessuna mossa ad alta leva approvata dalla traiettoria.',
    opportunity: approved.get('opportunity')
      ? sections.opportunity
      : context.relevance.items[0]?.headline ?? sections.opportunity,
    nourish: approved.get('nourish') ? sections.nourish : sections.nourish
  };
}
