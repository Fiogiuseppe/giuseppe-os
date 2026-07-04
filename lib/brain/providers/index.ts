import { isAIMockMode } from '../../ai/mode';
import { wrapProviderWithLogging } from '../../ai/loggedProvider';
import { createCompletionProvider } from '../../ai/completionAdapter';
import type { AIProvider, AIProviderName } from './types';
import { createMockProvider } from './mock';
import { createRuleBasedProvider } from './ruleBased';

/** @deprecated Legacy requesty provider — use AI_PROVIDER orchestrator instead. */
export { createRequestyProvider } from './requesty';

/** @deprecated Legacy gemini completion provider — use getAIProvider() instead. */
export { createGeminiProvider } from './gemini';

export function resolveAIProvider(): AIProvider {
  if (isAIMockMode()) {
    return createMockProvider();
  }

  return wrapProviderWithLogging(createCompletionProvider(), 'brain');
}

export { createRuleBasedProvider, createMockProvider };
