import { resolveAIMode } from '../../../lib/ai/mode';

export async function GET() {
  return Response.json({
    mode: resolveAIMode()
  });
}
