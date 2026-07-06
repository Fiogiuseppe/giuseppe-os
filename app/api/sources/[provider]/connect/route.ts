import { NextResponse } from 'next/server';

/** Phase 1: OAuth ships in Phase 9. */
export async function GET() {
  return NextResponse.json({ error: 'OAuth is not available in Phase 1. See Phase 9.' }, { status: 404 });
}
