import { CORE_PHILOSOPHY_PROMPT } from '../philosophy/core';

export async function loadConstitutionExcerpt(): Promise<string> {
  return CORE_PHILOSOPHY_PROMPT.slice(0, 2400);
}
