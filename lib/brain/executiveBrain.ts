import { buildContext } from './context/buildContext';
import { assembleDecisionAIResult } from './decisions/assemble';
import type { DecisionResponseSource } from './decisions/types';
import { detectIntent, detectTopics } from './intent/detectIntent';
import { routeEngines } from './intent/routeEngines';
import { runEnginePipeline } from './engines/pipeline';
import { loadBrain, loadWorkingMemory } from './memory/store';
import { applyMemoryUpdate, estimateConfidence, extractResponseNextAction } from './memory/update';
import { evaluateMissionAlignment } from './missionGate';
import { resolveAIProvider, createRuleBasedProvider } from './providers';
import { ProviderConfigurationError, ProviderRequestError } from './providers/types';
import { fetchRealityContext } from '../reality';
import type { BrainRequest, BrainResponse } from './types';

function validateRequest(request: BrainRequest): void {
  const intents = ['auto', 'query', 'decide', 'reflect', 'awareness', 'potential', 'learn'];
  if (!request.intent || !intents.includes(request.intent)) {
    throw new Error('Invalid intent.');
  }

  const hasMessage = Boolean(request.message?.trim());
  const hasDecision = Boolean(request.decision?.trim());

  if (request.intent === 'decide' && !hasMessage && !hasDecision) {
    throw new Error('Decision intent requires message or decision.');
  }

  if (!['auto', 'decide', 'awareness', 'potential', 'learn'].includes(request.intent) && !hasMessage) {
    throw new Error('Message is required.');
  }
}

function buildHeadline(intent: BrainRequest['intent'], outputs: Awaited<ReturnType<typeof runEnginePipeline>>['outputs']): string | undefined {
  if (intent === 'awareness' && outputs.awareness) {
    return outputs.awareness.headline;
  }
  return undefined;
}

function composeAnswer(intent: BrainRequest['intent'], providerAnswer: string, outputs: Awaited<ReturnType<typeof runEnginePipeline>>['outputs']): string {
  if (intent === 'awareness' && outputs.awareness) {
    return [
      outputs.awareness.headline,
      outputs.awareness.insight,
      '',
      outputs.awareness.whyItMatters,
      '',
      `Recommended action: ${outputs.awareness.recommendedAction}`,
      '',
      providerAnswer
    ].join('\n');
  }

  if (intent === 'potential' && outputs.opportunity) {
    return [
      `Opportunity: ${outputs.opportunity.title}`,
      `Reason: ${outputs.opportunity.reason}`,
      `First action: ${outputs.opportunity.firstAction}`,
      `Impact: ${outputs.opportunity.estimatedImpact}`,
      `Mission alignment: ${outputs.opportunity.missionAlignment}`,
      `Confidence: ${outputs.opportunity.confidenceScore}`,
      '',
      providerAnswer
    ].join('\n');
  }

  if (intent === 'learn' && outputs.learning) {
    return [
      'Learning report',
      `Patterns: ${outputs.learning.patterns.join('; ')}`,
      `Lessons: ${outputs.learning.lessons.map(item => item.lesson).join('; ') || 'none'}`,
      '',
      providerAnswer
    ].join('\n');
  }

  return providerAnswer;
}

export async function runExecutiveBrain(request: BrainRequest): Promise<BrainResponse> {
  validateRequest(request);

  const resolvedIntent = detectIntent(request);
  const normalizedRequest: BrainRequest = { ...request, intent: resolvedIntent };

  const brain = await loadBrain();
  const workingMemory = await loadWorkingMemory();
  const topics = detectTopics(
    [normalizedRequest.message, normalizedRequest.decision, normalizedRequest.reason].filter(Boolean).join(' ')
  );

  const plan = routeEngines(resolvedIntent, topics);
  const { outputs, engineContext } = await runEnginePipeline(normalizedRequest, plan, brain);

  const reality = await fetchRealityContext(normalizedRequest.message);
  const realityContext = reality.facts.length
    ? reality.facts.map(fact => `${fact.label}: ${fact.value}`).join('\n')
    : 'No live reality connectors active yet.';

  const context = buildContext(
    normalizedRequest,
    brain,
    workingMemory,
    `${engineContext}\n\nREALITY LAYER\n${realityContext}`
  );

  const provider = resolveAIProvider();
  const completionRequest = {
    system: context.systemPrompt,
    messages: [{ role: 'user' as const, content: context.userPrompt }],
    context,
    maxTokens: 1200,
    temperature: 0.4
  };

  let completion;
  let decisionSource: DecisionResponseSource = provider.name === 'rule-based' ? 'engine' : 'ai';

  try {
    completion = await provider.complete(completionRequest);
  } catch (error) {
    if (resolvedIntent === 'decide' && outputs.decision && error instanceof ProviderConfigurationError) {
      completion = await createRuleBasedProvider().complete(completionRequest);
      decisionSource = 'fallback';
    } else {
      throw error;
    }
  }

  const answer = composeAnswer(resolvedIntent, completion.content, outputs);
  const missionAligned = evaluateMissionAlignment(normalizedRequest, answer);
  const confidence = estimateConfidence(context);
  const persist = normalizedRequest.persist ?? resolvedIntent !== 'decide';

  const memoryResult = await applyMemoryUpdate({
    request: normalizedRequest,
    context,
    answer,
    workingMemory,
    persist
  });

  const decision =
    resolvedIntent === 'decide' && outputs.decision
      ? assembleDecisionAIResult({
          engine: outputs.decision,
          answer,
          confidence,
          source: decisionSource
        })
      : undefined;

  return {
    intent: resolvedIntent,
    answer,
    headline: buildHeadline(resolvedIntent, outputs),
    nextAction:
      decision?.nextAction ??
      extractResponseNextAction(answer) ??
      outputs.awareness?.recommendedAction ??
      outputs.opportunity?.firstAction,
    confidence,
    sources: [
      ...context.sources,
      ...reality.facts.map(fact => ({
        field: fact.id,
        sourceType: 'reality' as const,
        reliability: fact.reliability,
        observedAt: fact.observedAt
      }))
    ],
    slicesUsed: context.slices.map(slice => slice.id),
    engines: outputs.enginesUsed,
    memoryUpdated: memoryResult.updated,
    memoryDiscarded: memoryResult.discarded,
    missionAligned,
    timestamp: new Date().toISOString(),
    decision,
    awareness: outputs.awareness,
    opportunity: outputs.opportunity,
    learning: outputs.learning
  };
}

export function mapBrainError(error: unknown): { status: number; message: string } {
  if (error instanceof ProviderConfigurationError) {
    return {
      status: 503,
      message:
        'Giuseppe OS Brain non è configurato. Aggiungi ANTHROPIC_API_KEY in .env.local per attivare l’intelligenza AI.'
    };
  }

  if (error instanceof ProviderRequestError) {
    return { status: 502, message: error.message };
  }

  if (error instanceof Error) {
    return { status: 400, message: error.message };
  }

  return { status: 500, message: 'Executive Brain failed.' };
}
