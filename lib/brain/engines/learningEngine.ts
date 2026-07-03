import type { GiuseppeBrain, LearningReport, LongTermMemory, WorkingMemory } from '../types';
import { loadBrain, loadLongTermMemory, loadWorkingMemory } from '../memory/store';

function abandonedProjects(brain: GiuseppeBrain): string[] {
  return Object.entries(brain.projects)
    .filter(([, project]) => project.status === 'slow-active')
    .map(([name]) => name);
}

export function runLearningEngine(
  input: { brain?: GiuseppeBrain; workingMemory?: WorkingMemory; longTerm?: LongTermMemory } = {}
): LearningReport {
  const brain = input.brain;
  const workingMemory = input.workingMemory;
  const longTerm = input.longTerm;

  return {
    patterns: brain?.patterns ?? [],
    mistakes: [
      brain?.patterns.find(pattern => /troppi progetti|dispersione/i.test(pattern)) ?? '',
      brain?.patterns.find(pattern => /status|comfort/i.test(pattern)) ?? ''
    ].filter(Boolean),
    evolvingPriorities: brain?.priorities.slice(0, 3) ?? [],
    inconsistencies: [
      brain && brain.priorities[0]?.includes('pubblic') && brain.patterns[4]?.includes('visibilità')
        ? 'Vuole visibilità ma la pubblicazione resta in ritardo.'
        : '',
      brain && brain.patterns[0]?.includes('troppi progetti') && Object.keys(brain.projects).length > 5
        ? 'Troppi fronti attivi rispetto alla regola di concentrazione.'
        : ''
    ].filter(Boolean),
    abandonedProjects: brain ? abandonedProjects(brain) : [],
    lessons: (longTerm?.lessons ?? []).slice(-3).map(item => ({
      lesson: item.lesson,
      evidence: [item.source],
      confidence: 0.75
    })),
    growthOpportunities: [
      {
        title: 'Pubblicare un pensiero vero',
        reason: 'La reputazione stimata richiede prove pubbliche, non solo intenzioni.',
        firstAction: 'Pubblica una bozza in 30 minuti.'
      },
      {
        title: 'Automatizzare libertà finanziaria',
        reason: 'La liquidità senza automazione resta vulnerabile alla forza di volontà.',
        firstAction: 'Imposta un trasferimento ETF mensile.'
      }
    ],
    analyzedAt: new Date().toISOString()
  };
}

export async function runLearningEngineFromStore(): Promise<LearningReport> {
  const [brain, workingMemory, longTerm] = await Promise.all([
    loadBrain(),
    loadWorkingMemory(),
    loadLongTermMemory()
  ]);

  return runLearningEngine({ brain, workingMemory, longTerm });
}
