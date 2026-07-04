import { isAILiveMode } from '../../../../lib/ai/mode';
import {
  generateLiveCreateBrief,
  generateLocalCreateBrief
} from '../../../../lib/create/localBrief';

function parseLocale(body: Record<string, unknown> | null): 'it' | 'en' {
  return body?.locale === 'en' ? 'en' : 'it';
}

export async function GET() {
  return Response.json({
    status: 'ok',
    service: 'giuseppe-create-brief',
    defaultSource: 'local',
    liveEnabled: isAILiveMode()
  });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const locale = parseLocale(body);
    const analyze = body.analyze === true;

    if (analyze) {
      if (!isAILiveMode()) {
        return Response.json(
          { error: 'Live AI is disabled. Create uses local project intelligence only.' },
          { status: 403 }
        );
      }

      const response = await generateLiveCreateBrief(locale);
      return Response.json(response);
    }

    const response = await generateLocalCreateBrief(locale);
    return Response.json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Create brief failed.';
    return Response.json({ error: message }, { status: 500 });
  }
}
