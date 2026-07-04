import { resolveAIMode, shouldShowDevAiControls } from '../../../lib/ai/mode';

export async function GET() {
  if (!shouldShowDevAiControls()) {
    return Response.json({ showIndicator: false });
  }

  return Response.json({
    showIndicator: true,
    mode: resolveAIMode()
  });
}
