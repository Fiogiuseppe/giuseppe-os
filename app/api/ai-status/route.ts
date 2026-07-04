import { hasAnthropicApiKey, isClientAiToggleAllowed } from '../../../lib/ai/mode';

export async function GET() {
  const clientToggleEnabled = isClientAiToggleAllowed();

  return Response.json({
    liveAvailable: hasAnthropicApiKey() && clientToggleEnabled,
    clientToggleEnabled
  });
}
