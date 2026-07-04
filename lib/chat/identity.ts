import { buildGiuseppeSystemPrompt, loadGiuseppeIdentityPrompt } from '../ai/app-context';

export { loadGiuseppeIdentityPrompt };

export function buildChatSystemPrompt(): string {
  return buildGiuseppeSystemPrompt();
}
