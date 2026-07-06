import { NextResponse } from 'next/server';
import { handleOAuthCallback } from '../../../../../src/modules/sources/oauth/oauth-flow.server';
import { mapOAuthError } from '../../../../../src/modules/sources/oauth/oauth-errors';

/** Phase 12 — OAuth callback. Validates state server-side; never returns tokens. */
export async function GET(request: Request) {
  try {
    const { result, headers } = await handleOAuthCallback(request);

    const response = NextResponse.redirect(result.redirectTo, {
      status: result.ok ? 302 : 302
    });

    for (const [key, value] of headers.entries()) {
      response.headers.append(key, value);
    }

    return response;
  } catch (error) {
    const mapped = mapOAuthError(error);
    const response = NextResponse.json({ error: mapped.message, code: mapped.code }, { status: mapped.status });
    return response;
  }
}
