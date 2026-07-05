import { pickLocale, resolveLocale, type AppLocale } from '../i18n/locale';

export const MEDIUM_BIO_BLOCK = `About the author — Giuseppe Fioretti is an Italian designer and artist based in Copenhagen. He works at The LEGO Group exploring branding, storytelling, and the future of play. Previously Head of Brand Design at Desigual. His work moves between design, art, and reflection on how we shape the world and ourselves. @fiogiuseppe — fiogiuseppe.com`;

function buildContentEditorialRules(locale: AppLocale): string {
  const language = locale === 'en' ? 'English' : 'Italian';

  return `EDITORIAL RULES (non-negotiable):
- Tone: humble, human, storytelling-based. Never professor-like, never advertising language, never motivational-poster language.
- Never invent biographical or historical facts — only use what is in the SOURCE MATERIAL block. If information is missing, insert [VERIFY: detail needed] rather than inventing.
- Write all content in ${language} to match Giuseppe's working language. Do not mix languages in the main body.
- For Medium articles only: append the English author bio block verbatim at the end when instructed.
- Write as Giuseppe in first person when appropriate, but stay grounded in the facts provided.`;
}

export function buildContentSystemPrompt(localeInput?: AppLocale): string {
  const locale = resolveLocale(localeInput);

  return `${buildContentEditorialRules(locale)}

Use only the SOURCE MATERIAL below. Do not add facts, credentials, or projects that are not evidenced there.`;
}
