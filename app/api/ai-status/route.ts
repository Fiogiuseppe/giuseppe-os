import { hasAnthropicApiKey } from '../../../lib/ai/mode';

export async function GET() {
  return Response.json({
    liveAvailable: hasAnthropicApiKey()
  });
}
