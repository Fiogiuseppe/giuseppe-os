import { resolveAIMode } from '../../../lib/ai/mode';
import { resolveActiveProviderName } from '../../../lib/ai/orchestrator';

export async function GET() {
  return Response.json({
    mode: resolveAIMode(),
    provider: resolveActiveProviderName()
  });
}
