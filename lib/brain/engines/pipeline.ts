import { runAwarenessEngine } from '../../../engine/awarenessEngine';
import { runPotentialEngine } from '../../../engine/potentialEngine';
import { runDecisionEngine } from '../../../engine/decisionEngine';
import type { BrainRequest, EngineOutputs, EngineRoutePlan, GiuseppeBrain } from '../types';
import { runLearningEngine } from './learningEngine';

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
  return [
    `Opportunity: ${result.title}`,
    `Reason: ${result.reason}`,
    `First action: ${result.firstAction}`,
    `Impact: ${result.estimatedImpact}`,
    `Mission alignment: ${result.missionAlignment}`,
    `Confidence: ${result.confidenceScore}`
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

  if (plan.engines.includes('awareness')) {
    outputs.awareness = runAwarenessEngine({ proactive: true });
    outputs.enginesUsed.push('awareness');
    blocks.push(formatAwarenessOutput(outputs.awareness));
  }

  if (plan.engines.includes('potential')) {
    const potential = runPotentialEngine();
    outputs.opportunity = potential.todaysOpportunity;
    outputs.enginesUsed.push('potential');
    blocks.push(formatPotentialOutput(outputs.opportunity));
  }

  if (plan.engines.includes('decision') && (request.decision || request.message)) {
    const decision = request.decision?.trim() || request.message.trim();
    const reason = request.reason?.trim() || '';
    const decisionResult = runDecisionEngine({ decision, reason });
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
