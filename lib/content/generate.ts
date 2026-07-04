import { CREATIVE_CONTENT_TEMPERATURE } from '../ai/jsonCompletion';
import { isAIMockMode } from '../ai/mode';
import { runWithAICallMeta } from '../ai/callContext';
import { resolveAIProvider } from '../brain/providers';
import { buildContentSystemPrompt } from './rules';
import { buildMockContent } from './mockOutputs';
import { buildFormatUserPrompt } from './prompts';
import { gatherSourceMaterial } from './sourceMaterial';
import type { ContentFormat, ContentGenerateRequest, ContentGenerateResponse } from './types';

const VALID_FORMATS: ContentFormat[] = ['medium', 'linkedin', 'instagram-story'];

function parseFormats(formats: unknown): ContentFormat[] {
  if (!Array.isArray(formats) || formats.length === 0) {
    throw new Error('At least one format is required.');
  }

  const parsed = formats.filter((format): format is ContentFormat =>
    VALID_FORMATS.includes(format as ContentFormat)
  );

  if (parsed.length === 0) {
    throw new Error('Invalid formats requested.');
  }

  return parsed;
}

function parseInstagramStory(content: string): string[] {
  const trimmed = content.trim();
  try {
    const parsed = JSON.parse(trimmed) as unknown;
    if (Array.isArray(parsed) && parsed.every(item => typeof item === 'string')) {
      return parsed;
    }
  } catch {
    // fall through to line parsing
  }

  return trimmed
    .split('\n')
    .map(line => line.replace(/^[-*\d.)\s]+/, '').trim())
    .filter(Boolean)
    .slice(0, 5);
}

async function generateFormatLive(format: ContentFormat, material: Awaited<ReturnType<typeof gatherSourceMaterial>>) {
  const provider = resolveAIProvider();
  const isInstagram = format === 'instagram-story';
  const response = await provider.complete({
    system: buildContentSystemPrompt(),
    messages: [{ role: 'user', content: buildFormatUserPrompt(format, material) }],
    maxTokens: format === 'medium' ? 2200 : format === 'linkedin' ? 700 : 500,
    temperature: isInstagram ? 0.35 : CREATIVE_CONTENT_TEMPERATURE,
    expectJson: isInstagram
  });

  if (format === 'instagram-story') {
    return parseInstagramStory(response.content);
  }

  return response.content.trim();
}

export async function generateContent(input: ContentGenerateRequest): Promise<ContentGenerateResponse> {
  const formats = parseFormats(input.formats);
  const material = await gatherSourceMaterial({
    sourceType: input.sourceType,
    sourceId: input.sourceId,
    topic: input.topic
  });

  const source = isAIMockMode() ? 'mock' : 'live';
  const result: ContentGenerateResponse = { source };

  for (const format of formats) {
    if (source === 'mock') {
      const mock = buildMockContent(format, material);
      if (format === 'instagram-story') {
        result.instagramStory = mock as string[];
      } else if (format === 'medium') {
        result.medium = mock as string;
      } else {
        result.linkedin = mock as string;
      }
      continue;
    }

    const live = await runWithAICallMeta({ page: 'content', reason: `generate-${format}` }, () =>
      generateFormatLive(format, material)
    );

    if (format === 'instagram-story') {
      result.instagramStory = live as string[];
    } else if (format === 'medium') {
      result.medium = live as string;
    } else {
      result.linkedin = live as string;
    }
  }

  return result;
}
