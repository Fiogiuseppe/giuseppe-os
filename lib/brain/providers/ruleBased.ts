import { runDecisionEngine } from '../../../engine/decisionEngine';
import { runAwarenessEngine } from '../../../engine/awarenessEngine';
import { runPotentialEngine } from '../../../engine/potentialEngine';
import { runLearningEngine } from '../engines/learningEngine';
import type { AICompletionRequest, AICompletionResponse, AIProvider } from './types';

function formatDecisionResult(result: ReturnType<typeof runDecisionEngine>): string {
  const counsellors = Object.entries(result.counsellors)
    .map(([key, text]) => `${key}: ${text}`)
    .join('\n');

  const capitals = Object.entries(result.capitals)
    .map(([key, value]) => `${key} (${value.score}): ${value.note}`)
    .join('\n');

  return [
    `Categoria: ${result.categoryLabel}`,
    `Bisogno nascosto: ${result.hiddenNeed}`,
    `Bias possibile: ${result.bias}`,
    '',
    'Sei capitali:',
    capitals,
    '',
    'Board:',
    counsellors,
    '',
    `Versione migliore: ${result.betterVersion}`,
    `Prossimo passo: ${result.nextAction}`
  ].join('\n');
}

export function createRuleBasedProvider(): AIProvider {
  return {
    name: 'rule-based',
    async complete(request: AICompletionRequest): Promise<AICompletionResponse> {
      const intent = request.context?.intent ?? 'query';

      if (intent === 'decide') {
        const decisionMatch = request.messages[0]?.content.match(/Decision:\s*(.+)/i);
        const reasonMatch = request.messages[0]?.content.match(/Reason:\s*(.+)/i);
        const decision = decisionMatch?.[1]?.trim() ?? request.messages[0]?.content ?? '';
        const reason = reasonMatch?.[1]?.trim() ?? '';
        const result = runDecisionEngine({ decision, reason });
        return {
          content: formatDecisionResult(result),
          model: 'giuseppe-rule-engine'
        };
      }

      if (intent === 'awareness' || intent === 'reflect') {
        const awareness = runAwarenessEngine({ proactive: true });
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
        const potential = runPotentialEngine();
        const today = potential.todaysOpportunity;
        return {
          content: [
            `Opportunity: ${today.title}`,
            `Reason: ${today.reason}`,
            `First action: ${today.firstAction}`,
            `Impact: ${today.estimatedImpact}`,
            `Mission alignment: ${today.missionAlignment}`,
            `Confidence: ${today.confidenceScore}`
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
