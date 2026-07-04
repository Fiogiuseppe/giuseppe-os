import { buildContext } from './context/buildContext';
import { assembleDecisionAIResult } from './decisions/assemble';
import type { DecisionResponseSource } from './decisions/types';
import { detectIntent, detectTopics } from './intent/detectIntent';
import { routeEngines } from './intent/routeEngines';
import { runEnginePipeline } from './engines/pipeline';
import { loadBrain, loadLongTermMemory, loadWorkingMemory } from './memory/store';
import { applyMemoryUpdate, estimateConfidence, extractResponseNextAction } from './memory/update';
import { evaluateMissionAlignment } from './missionGate';
import { resolveAIProvider, createRuleBasedProvider } from './providers';
import { ProviderConfigurationError, ProviderRequestError } from './providers/types';
import { runWithAICallMeta, intentToPage } from '../ai/callContext';
import { fetchRealityContext } from '../reality';
import { assessEvidence } from '../memory/evidence';
import { recordDecisionRecommendation } from '../decision-learning/learning';
import { buildEvidenceSnapshot } from '../memory/insights';
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
    ]
      .filter(Boolean)
      .join('\n');
  }

  if (intent === 'reflect' && outputs.awareness) {
    return [
      outputs.awareness.headline,
      outputs.awareness.insight,
      '',
      outputs.awareness.whyItMatters,
      '',
      providerAnswer
    ]
      .filter(Boolean)
      .join('\n');
  }

  if (intent === 'potential' && outputs.opportunity) {
    const confidence =
      outputs.opportunity.confidenceScore !== null
        ? String(outputs.opportunity.confidenceScore)
        : outputs.opportunity.confidenceLabel;
    return [
      `Opportunity: ${outputs.opportunity.title}`,
      `Reason: ${outputs.opportunity.reason}`,
      `First action: ${outputs.opportunity.firstAction}`,
      `Impact: ${outputs.opportunity.estimatedImpact}`,
      `Mission alignment: ${outputs.opportunity.missionAlignment}`,
      `Confidence: ${confidence}`,
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
  const longTermMemory = await loadLongTermMemory();
  const evidenceAssessment = assessEvidence(buildEvidenceSnapshot(longTermMemory, workingMemory));
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
    completion = await runWithAICallMeta(
      {
        page: intentToPage(resolvedIntent),
        reason: resolvedIntent === 'decide' ? 'user-submit' : `${resolvedIntent}-request`
      },
      () => provider.complete(completionRequest)
    );
  } catch (error) {
    const providerFailed =
      error instanceof ProviderConfigurationError || error instanceof ProviderRequestError;

    if (!providerFailed) {
      throw error;
    }

    if (resolvedIntent === 'decide' && outputs.decision) {
      completion = await createRuleBasedProvider().complete(completionRequest);
      decisionSource = 'fallback';
    } else if (resolvedIntent === 'awareness' && outputs.awareness) {
      completion = { content: '', model: 'engine' };
    } else if (resolvedIntent === 'potential' && outputs.potentialBrief) {
      completion = { content: '', model: 'engine' };
    } else if (resolvedIntent === 'reflect' && outputs.awareness) {
      completion = { content: '', model: 'engine' };
    } else if (resolvedIntent === 'learn' && outputs.learning) {
      completion = { content: '', model: 'engine' };
    } else if (resolvedIntent === 'query') {
      completion = await createRuleBasedProvider().complete(completionRequest);
    } else {
      throw error;
    }
  }

  const answer = composeAnswer(resolvedIntent, completion.content, outputs);
  const missionAligned = evaluateMissionAlignment(normalizedRequest, answer);
  const confidence = estimateConfidence(context, evidenceAssessment);
  const persist = normalizedRequest.persist ?? true;

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
          evidenceAssessment,
          source: decisionSource,
          locale: normalizedRequest.locale ?? context.locale
        })
      : undefined;

  let decisionRecordId: string | undefined;

  if (resolvedIntent === 'decide' && decision && normalizedRequest.decision && persist) {
    const recorded = await recordDecisionRecommendation({
      decision: normalizedRequest.decision,
      reason: normalizedRequest.reason ?? '',
      result: decision,
      confidenceBefore: confidence
    });
    decisionRecordId = recorded.id;
  }

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
    potentialBrief: outputs.potentialBrief,
    learning: outputs.learning,
    decisionRecordId
  };
}

export function mapBrainError(error: unknown): { status: number; message: string } {
  if (error instanceof ProviderConfigurationError) {
    return {
      status: 503,
      message:
        'Giuseppe OS Brain non è configurato. Aggiungi le credenziali AI in .env.local per attivare l’intelligenza AI.'
    };
  }

  if (error instanceof ProviderRequestError) {
    if (/credit balance|billing|purchase credits/i.test(error.message)) {
      return {
        status: 502,
        message:
          'Il servizio AI non è disponibile al momento. Giuseppe OS userà il motore decisionale locale quando possibile.'
      };
    }

    return {
      status: 502,
      message: 'Giuseppe OS non ha potuto contattare il servizio AI. Riprova tra poco.'
    };
  }

  if (error instanceof Error) {
    return { status: 400, message: error.message };
  }

  return { status: 500, message: 'Executive Brain failed.' };
}
