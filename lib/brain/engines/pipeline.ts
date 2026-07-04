import { runAwarenessEngine } from '../../../engine/awarenessEngine';
import { runPotentialEngine } from '../../../engine/potentialEngine';
import { runDecisionEngine } from '../../../engine/decisionEngine';
import type { BrainRequest, EngineOutputs, EngineRoutePlan, GiuseppeBrain } from '../types';
import { runLearningEngine } from './learningEngine';
import { loadLongTermMemory, loadWorkingMemory } from '../memory/store';
import { buildEvidenceSnapshot, recordInsightObservation } from '../../memory/insights';
import { assessEvidence } from '../../memory/evidence';

function formatDecisionOutput(result: ReturnType<typeof runDecisionEngine>): string {
  return [
    `Decision category: ${result.categoryLabel}`,
    `Hidden need: ${result.hiddenNeed}`,
    `Bias: ${result.bias}`,
    `Better version: ${result.betterVersion}`,
    `Next action: ${result.nextAction}`
  ].join('\n');
}

function formatAwarenessOutput(result: ReturnType<typeof runAwarenessEngine>): string {
  return [
    `Signal: ${result.signalType} — ${result.insight}`,
    `Why it matters: ${result.whyItMatters}`,
    `Risk if ignored: ${result.riskIfIgnored}`,
    `Recommended action: ${result.recommendedAction}`
  ].join('\n');
}

function formatPotentialOutput(result: ReturnType<typeof runPotentialEngine>['todaysOpportunity']): string {
  const confidence =
    result.confidenceScore !== null ? String(result.confidenceScore) : result.confidenceLabel;
  return [
    `Opportunity: ${result.title}`,
    `Reason: ${result.reason}`,
    `First action: ${result.firstAction}`,
    `Impact: ${result.estimatedImpact}`,
    `Mission alignment: ${result.missionAlignment}`,
    `Confidence: ${confidence}`
  ].join('\n');
}

function formatLearningOutput(result: ReturnType<typeof runLearningEngine>): string {
  return [
    `Patterns: ${result.patterns.join('; ') || 'none'}`,
    `Lessons: ${result.lessons.map(item => item.lesson).join('; ') || 'none'}`,
    `Growth: ${result.growthOpportunities.map(item => item.title).join('; ') || 'none'}`
  ].join('\n');
}

export async function runEnginePipeline(
  request: BrainRequest,
  plan: EngineRoutePlan,
  brain: GiuseppeBrain
): Promise<{ outputs: EngineOutputs; engineContext: string }> {
  const outputs: EngineOutputs = { enginesUsed: [] };
  const blocks: string[] = [];
  const longTerm = await loadLongTermMemory();
  const working = await loadWorkingMemory();
  const persist = request.persist ?? true;

  if (plan.engines.includes('awareness')) {
    outputs.awareness = runAwarenessEngine({ proactive: true, longTerm, working });
    outputs.enginesUsed.push('awareness');
    blocks.push(formatAwarenessOutput(outputs.awareness));

    if (persist) {
      const assessment = assessEvidence(buildEvidenceSnapshot(longTerm, working));
      await recordInsightObservation(outputs.awareness, assessment.score);
    }
  }

  if (plan.engines.includes('potential')) {
    const potential = runPotentialEngine({ longTerm, working });
    outputs.opportunity = potential.todaysOpportunity;
    outputs.potentialBrief = potential;
    outputs.enginesUsed.push('potential');
    blocks.push(formatPotentialOutput(outputs.opportunity));
  }

  if (plan.engines.includes('decision') && (request.decision || request.message)) {
    const decision = request.decision?.trim() || request.message.trim();
    const reason = request.reason?.trim() || '';
    const decisionResult = runDecisionEngine({ decision, reason });
    outputs.decision = decisionResult;
    outputs.enginesUsed.push('decision');
    blocks.push(formatDecisionOutput(decisionResult));
  }

  if (plan.engines.includes('learning')) {
    outputs.learning = runLearningEngine({ brain });
    outputs.enginesUsed.push('learning');
    blocks.push(formatLearningOutput(outputs.learning));
  }

  return {
    outputs,
    engineContext: blocks.join('\n\n')
  };
}
