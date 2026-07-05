import { NextResponse } from 'next/server';
import { resolveLocale } from '../../../../lib/i18n/locale';
import { generateContent } from '../../../../lib/content/generate';
import type { ContentGenerateRequest, ContentSourceType } from '../../../../lib/content/types';

function parseSourceType(value: unknown): ContentSourceType {
  if (value === 'decision' || value === 'insight' || value === 'pattern' || value === 'freeform') {
    return value;
  }
  throw new Error('Invalid sourceType.');
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as Partial<ContentGenerateRequest>;
    const sourceType = parseSourceType(body.sourceType);
    const formats = body.formats;

    const response = await generateContent({
      sourceType,
      sourceId: typeof body.sourceId === 'string' ? body.sourceId : undefined,
      topic: typeof body.topic === 'string' ? body.topic : undefined,
      formats: formats as ContentGenerateRequest['formats'],
      locale: resolveLocale(typeof body.locale === 'string' ? body.locale : undefined)
    });

    return NextResponse.json(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Content generation failed.';
    const status = message.includes('required') || message.includes('Invalid') || message.includes('No ') ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
