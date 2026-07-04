import { generateWeeklyBoard, mapWeeklyBoardError } from '../../../lib/weekly-board/generate';
import { isAILiveMode, resolveAIMode, resolveConfiguredAiProvider } from '../../../lib/ai/mode';

function parseLocale(body: Record<string, unknown> | null): 'it' | 'en' {
  return body?.locale === 'en' ? 'en' : 'it';
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const regenerate = body.regenerate === true;

    if (regenerate && !isAILiveMode()) {
      return Response.json(
        { error: 'Regenerate is available only when live AI is enabled on the server.' },
        { status: 403 }
      );
    }

    const response = await generateWeeklyBoard(parseLocale(body), { regenerate });
    return Response.json(response);
  } catch (error) {
    const mapped = mapWeeklyBoardError(error);
    return Response.json({ error: mapped.message }, { status: mapped.status });
  }
}

export async function GET() {
  return Response.json({
    status: 'ok',
    service: 'giuseppe-personal-intelligence-os',
    version: '1.0.0-weekly-board',
    method: 'POST',
    aiMode: resolveAIMode(),
    provider: resolveConfiguredAiProvider(),
    cache: 'iso-week',
    pipeline: ['oracle-evidence', 'weekly-board-generator']
  });
}
