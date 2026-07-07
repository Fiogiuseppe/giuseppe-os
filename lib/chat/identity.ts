import { buildGiuseppeSystemPrompt, loadGiuseppeIdentityPrompt } from '../ai/app-context';
import { IDENTITY_COMPANION_PROMPT } from './companion-prompt';
import { buildKnowledgeContextBlock } from './knowledge-context.server';

export { loadGiuseppeIdentityPrompt };

export async function buildChatSystemPrompt(): Promise<string> {
  const knowledge = await buildKnowledgeContextBlock();

  return [buildGiuseppeSystemPrompt(), IDENTITY_COMPANION_PROMPT, knowledge].join('\n\n');
}
