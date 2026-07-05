import { pickLocale, type AppLocale } from '../../i18n/locale';

export function buildDecideJsonInstruction(locale: AppLocale): string {
  const categoryLabelHint = pickLocale(
    locale,
    'etichetta categoria in italiano',
    'category label in English'
  );

  return [
    'Return ONLY valid JSON. No markdown. No prose outside JSON.',
    'Schema:',
    '{',
    '  "recommendation": "one clear mission-driven recommendation",',
    '  "whyItMatters": "why this matters for Giuseppe\'s North Star and Mission 2036",',
    '  "hiddenNeed": "the hidden need beneath the decision",',
    '  "bias": "possible bias to watch",',
    '  "boardPerspective": "short synthesis of counsellor voices in Giuseppe OS tone",',
    '  "nextAction": "one concrete next action",',
    '  "confidenceScore": 0-100,',
    `  "categoryLabel": "${categoryLabelHint}",`,
    '  "betterVersion": "a better aligned version of the decision"',
    '}',
    'Speak as Giuseppe OS: personal, direct, contextual, mission-driven — never generic chatbot tone.',
    'Respect financial privacy: never invent balances or expose redacted numbers.'
  ].join('\n');
}
