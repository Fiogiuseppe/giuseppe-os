import { runDecisionEngine, COUNSELLOR_LABELS } from '../../../engine/decisionEngine';
import { runAwarenessEngine } from '../../../engine/awarenessEngine';
import { runPotentialEngine } from '../../../engine/potentialEngine';
import { runLearningEngine } from '../engines/learningEngine';
import { loadLongTermMemory, loadWorkingMemory } from '../memory/store';
import { buildEvidenceSnapshot } from '../../memory/insights';
import { assessEvidence, confidenceFromEvidence } from '../../memory/evidence';
import type { AICompletionRequest, AICompletionResponse, AIProvider } from './types';

function formatDecisionResult(result: ReturnType<typeof runDecisionEngine>, confidenceScore: number | null): string {
  const boardPerspective = Object.entries(result.counsellors)
    .map(([key, text]) => `${COUNSELLOR_LABELS[key as keyof typeof result.counsellors]}: ${text}`)
    .join('\n');

  return JSON.stringify({
    recommendation: result.betterVersion,
    whyItMatters: `Questa scelta tocca la North Star: ${result.betterVersion}`,
    hiddenNeed: result.hiddenNeed,
    bias: result.bias,
    boardPerspective,
    nextAction: result.nextAction,
    confidenceScore,
    categoryLabel: result.categoryLabel,
    betterVersion: result.betterVersion
  });
}

export function createRuleBasedProvider(): AIProvider {
  return {
    name: 'rule-based',
    async complete(request: AICompletionRequest): Promise<AICompletionResponse> {
      const intent = request.context?.intent ?? 'query';
      const longTerm = await loadLongTermMemory();
      const working = await loadWorkingMemory();
      const assessment = assessEvidence(buildEvidenceSnapshot(longTerm, working));

      if (intent === 'decide') {
        const decisionMatch = request.messages[0]?.content.match(/Decision:\s*(.+)/i);
        const reasonMatch = request.messages[0]?.content.match(/Reason:\s*(.+)/i);
        const decision = decisionMatch?.[1]?.trim() ?? request.messages[0]?.content ?? '';
        const reason = reasonMatch?.[1]?.trim() ?? '';
        const result = runDecisionEngine({ decision, reason });
        const confidence = confidenceFromEvidence(assessment, 3);
        return {
          content: formatDecisionResult(result, confidence.value),
          model: 'giuseppe-rule-engine'
        };
      }

      if (intent === 'awareness' || intent === 'reflect') {
        const awareness = runAwarenessEngine({ proactive: true, longTerm, working });
        return {
          content: [
            awareness.headline,
            awareness.insight,
            '',
            `Perché conta: ${awareness.whyItMatters}`,
            `Azione consigliata: ${awareness.recommendedAction}`,
            `Prossimo passo: ${awareness.recommendedAction}`
          ].join('\n'),
          model: 'giuseppe-awareness-engine'
        };
      }

      if (intent === 'potential') {
        const potential = runPotentialEngine({ longTerm, working });
        const today = potential.todaysOpportunity;
        const confidence =
          today.confidenceScore !== null ? String(today.confidenceScore) : today.confidenceLabel;
        return {
          content: [
            `Opportunity: ${today.title}`,
            `Reason: ${today.reason}`,
            `First action: ${today.firstAction}`,
            `Impact: ${today.estimatedImpact}`,
            `Mission alignment: ${today.missionAlignment}`,
            `Confidence: ${confidence}`
          ].join('\n'),
          model: 'giuseppe-potential-engine'
        };
      }

      if (intent === 'learn') {
        const learning = runLearningEngine();
        return {
          content: [
            `Patterns: ${learning.patterns.join('; ')}`,
            `Lessons: ${learning.lessons.map(item => item.lesson).join('; ') || 'none'}`,
            `Growth: ${learning.growthOpportunities.map(item => item.title).join('; ')}`
          ].join('\n'),
          model: 'giuseppe-learning-engine'
        };
      }

      const northStar = request.context?.identity.northStar ?? 'North Star unavailable';
      return {
        content: [
          'Giuseppe OS è attivo.',
          `North Star: ${northStar}`,
          request.messages[0]?.content ?? ''
        ].join('\n\n'),
        model: 'giuseppe-memory-engine'
      };
    }
  };
}
