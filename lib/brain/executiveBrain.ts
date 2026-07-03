import { buildContext } from './context/buildContext';
import { loadBrain, loadWorkingMemory } from './memory/store';
import { applyMemoryUpdate, estimateConfidence, extractResponseNextAction } from './memory/update';
import { resolveAIProvider } from './providers';
import { ProviderConfigurationError, ProviderRequestError } from './providers/types';
import type { BrainRequest, BrainResponse } from './types';

function validateRequest(request: BrainRequest): void {
  if (!request.intent || !['query', 'decide', 'reflect'].includes(request.intent)) {
    throw new Error('Invalid intent. Use query, decide, or reflect.');
  }

  const hasMessage = Boolean(request.message?.trim());
  const hasDecision = Boolean(request.decision?.trim());

  if (request.intent === 'decide' && !hasMessage && !hasDecision) {
    throw new Error('Decision intent requires message or decision.');
  }

  if (request.intent !== 'decide' && !hasMessage) {
    throw new Error('Message is required.');
  }
}

export async function runExecutiveBrain(request: BrainRequest): Promise<BrainResponse> {
  validateRequest(request);

  const brain = await loadBrain();
  const workingMemory = await loadWorkingMemory();
  const context = buildContext(request, brain, workingMemory);
  const provider = resolveAIProvider();

  const completion = await provider.complete({
    system: context.systemPrompt,
    messages: [{ role: 'user', content: context.userPrompt }],
    context,
    maxTokens: 1200,
    temperature: 0.4
  });

  const memoryResult = await applyMemoryUpdate({
    request,
    context,
    answer: completion.content,
    workingMemory
  });

  return {
    intent: request.intent,
    answer: completion.content,
    nextAction: extractResponseNextAction(completion.content),
    confidence: estimateConfidence(context),
    sources: context.sources,
    memoryUpdated: memoryResult.updated,
    timestamp: new Date().toISOString()
  };
}

export function mapBrainError(error: unknown): { status: number; message: string } {
  if (error instanceof ProviderConfigurationError) {
    return { status: 503, message: error.message };
  }

  if (error instanceof ProviderRequestError) {
    return { status: 502, message: error.message };
  }

  if (error instanceof Error) {
    return { status: 400, message: error.message };
  }

  return { status: 500, message: 'Executive Brain failed.' };
}
