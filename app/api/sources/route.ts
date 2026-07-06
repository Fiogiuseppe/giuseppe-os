import { applyPlatformAction, listProviderStatuses, syncSource } from '../../../src/modules/sources/platform/platform.server';
import { parseSourceActionRequest } from '../../../src/modules/sources/services/sources.server';

/** Phase 2: safe metadata from persistent engine. */
export async function GET() {
  return Response.json({
    sources: await listProviderStatuses(),
    updatedAt: new Date().toISOString()
  });
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const payload = parseSourceActionRequest(body);
  if (!payload) {
    return Response.json({ error: 'Invalid source action request.' }, { status: 400 });
  }

  const simulateFailure =
    process.env.ALLOW_TEST_ROUTES === '1' &&
    body &&
    typeof body === 'object' &&
    (body as Record<string, unknown>).simulateFailure === true;

  if (simulateFailure && payload.action !== 'sync') {
    return Response.json({ error: 'simulateFailure applies only to sync.' }, { status: 400 });
  }

  try {
    const result =
      payload.action === 'sync' && simulateFailure
        ? await syncSource(payload.sourceId, { mode: 'manual', simulateFailure: true })
        : await applyPlatformAction(payload.sourceId, payload.action);

    return Response.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Source action failed.';
    return Response.json({ error: message }, { status: 400 });
  }
}
