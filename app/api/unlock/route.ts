import { NextResponse } from 'next/server';
import { AUTH_COOKIE, getSessionToken } from '../../../lib/auth';

export async function POST(request: Request) {
  const password = process.env.GIUSEPPE_OS_PASSWORD;
  const token = getSessionToken();

  if (!password || !token) {
    return NextResponse.json({ error: 'Auth not configured' }, { status: 500 });
  }

  const body = (await request.json()) as { password?: string };
  if (!body.password || body.password !== password) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(AUTH_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7
  });

  return response;
}
