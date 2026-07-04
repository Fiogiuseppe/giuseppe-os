import { MEDIUM_BIO_BLOCK } from './rules';
import type { ContentFormat } from './types';
import type { SourceMaterial } from './types';

export function buildFormatUserPrompt(format: ContentFormat, material: SourceMaterial): string {
  const sourceBlock = `SOURCE MATERIAL (${material.sourceType}):
title: ${material.title}
summary: ${material.summary}

${material.body}`;

  if (format === 'medium') {
    return `${sourceBlock}

Write a Medium article in English (600-900 words) based only on the source material.
Structure: opening scene or moment, the tension, what Giuseppe noticed, what changed, a quiet lesson — no hype.
End the article with this exact bio block on its own lines (verbatim, no changes):

${MEDIUM_BIO_BLOCK}

Return only the article text.`;
  }

  if (format === 'linkedin') {
    return `${sourceBlock}

Write a LinkedIn launch post in English (150-250 words) that introduces the Medium article idea without being salesy.
Human, specific, one clear reason to read — not a billboard. Return only the post text.`;
  }

  return `${sourceBlock}

Write 3-5 Instagram story card texts in English for this idea.
Each card must be under 30 words. Return ONLY a JSON array of strings, no markdown, no commentary.
Example: ["card one text", "card two text"]`;
}
