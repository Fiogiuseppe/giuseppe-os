import { NextResponse } from 'next/server';
import { listSourceSyncRuns } from '../../../../../src/modules/sources/platform/platform.server';
import { isSourceProviderId } from '../../../../../src/modules/sources/providers/source-registry';

type RouteContext = {
  params: Promise<{ provider: string }>;
};

/** Phase 2: safe sync run metadata — no tokens or raw payloads. */
export async function GET(_request: Request, context: RouteContext) {
  const { provider } = await context.params;

  if (!isSourceProviderId(provider)) {
    return NextResponse.json({ error: 'Unknown source provider.' }, { status: 404 });
  }

  const runs = await listSourceSyncRuns(provider);
  return NextResponse.json({ sourceId: provider, runs });
}
