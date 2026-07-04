export const MEDIUM_BIO_BLOCK = `About the author — Giuseppe Fioretti is an Italian designer and artist based in Copenhagen. He works at The LEGO Group exploring branding, storytelling, and the future of play. Previously Head of Brand Design at Desigual. His work moves between design, art, and reflection on how we shape the world and ourselves. @fiogiuseppe — fiogiuseppe.com`;

export const CONTENT_EDITORIAL_RULES = `EDITORIAL RULES (non-negotiable):
- Tone: humble, human, storytelling-based. Never professor-like, never advertising language, never motivational-poster language.
- Never invent biographical or historical facts — only use what is in the SOURCE MATERIAL block. If information is missing, insert [VERIFY: detail needed] rather than inventing.
- All public-facing content is written in English regardless of source language.
- Write as Giuseppe in first person when appropriate, but stay grounded in the facts provided.`;

export function buildContentSystemPrompt(): string {
  return `${CONTENT_EDITORIAL_RULES}

Use only the SOURCE MATERIAL below. Do not add facts, credentials, or projects that are not evidenced there.`;
}
