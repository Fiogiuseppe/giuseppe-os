import { parseSourceActionRequest } from '../../../src/modules/sources/services/sources.server';
import { listPhase1MockStatuses } from '../../../src/modules/sources/services/phase1-mock-status.server';

/** Phase 1: read-only mock metadata. Connect/sync ship in Phase 2. */
export async function GET() {
  return Response.json({
    sources: listPhase1MockStatuses(),
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

  return Response.json(
    { error: 'Source actions are not available in Phase 1. See Phase 2.' },
    { status: 501 }
  );
}
