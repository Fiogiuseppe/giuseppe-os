import { NextResponse } from 'next/server';
import { listSourceSyncRuns } from '../../../../../src/modules/sources/platform/platform.server';
import { isSourceProviderId } from '../../../../../src/modules/sources/providers/source-registry';
import { normalizeSourceId } from '../../../../../src/modules/sources/config/source-config';

type RouteContext = {
  params: Promise<{ provider: string }>;
};

/** Phase 2: safe sync run metadata — no tokens or raw payloads. */
export async function GET(_request: Request, context: RouteContext) {
  const { provider } = await context.params;

  if (!isSourceProviderId(provider)) {
    return NextResponse.json({ error: 'Unknown source provider.' }, { status: 404 });
  }

  const sourceId = normalizeSourceId(provider)!;
  const runs = await listSourceSyncRuns(sourceId);
  return NextResponse.json({ sourceId, runs });
}
