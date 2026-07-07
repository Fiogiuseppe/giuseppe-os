import { resolveLocale, type AppLocale } from '../i18n/locale';
import { loadGiuseppeWritingVoicePrompt } from '../ai/app-context';

export const MEDIUM_BIO_BLOCK = `About the author — Giuseppe Fioretti is an Italian designer and artist based in Copenhagen. He works at The LEGO Group exploring branding, storytelling, and the future of play. Previously Head of Brand Design at Desigual. His work moves between design, art, and reflection on how we shape the world and ourselves. @fiogiuseppe — fiogiuseppe.com`;

function buildContentEditorialRules(locale: AppLocale): string {
  const language = locale === 'en' ? 'English' : 'Italian';

  return `EDITORIAL RULES (non-negotiable):
- Apply the WRITING VOICE CONSTITUTION below for all Giuseppe-facing prose.
- Giuseppe never writes to describe himself — he writes what he's exploring; discovery is indirect.
- If a paragraph has too many qualities, achievements or identity labels, rewrite toward curiosity.
- Write all content in ${language} to match Giuseppe's working language. Do not mix languages in the main body.
- Never invent biographical or historical facts — only use what is in the SOURCE MATERIAL block. If information is missing, insert [VERIFY: detail needed] rather than inventing.
- For Medium articles only: append the English author bio block verbatim at the end when instructed.`;
}

export function buildContentSystemPrompt(localeInput?: AppLocale): string {
  const locale = resolveLocale(localeInput);

  return `${loadGiuseppeWritingVoicePrompt()}

${buildContentEditorialRules(locale)}

Use only the SOURCE MATERIAL below. Do not add facts, credentials, or projects that are not evidenced there.`;
}
