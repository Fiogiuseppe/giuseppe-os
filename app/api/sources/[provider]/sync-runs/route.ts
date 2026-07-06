import { NextResponse } from 'next/server';

/** Phase 1: Sync logs ship in Phase 2. */
export async function GET() {
  return NextResponse.json({ error: 'Sync logs are not available in Phase 1. See Phase 2.' }, { status: 404 });
}
