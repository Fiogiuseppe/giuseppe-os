import type { BrainIntent, BrainRequest, ContextTopic } from '../types';

const DECIDE_RE =
  /decid|compr|invest|vend|pubblic|lanci|accett|rifiut|spost|lasci|inizi|congel|wrangler|casa|etf/i;
const REFLECT_RE = /riflett|drift|perso|allineat|chi sono|diventare|pattern|contradd/i;
const AWARENESS_RE = /notic|awareness|pattern|rischio|contrad|opportunit/i;
const POTENTIAL_RE = /opportunit|focus|priorit|oggi|today|cosa fare/i;
const LEARN_RE = /learn|lesson|pattern|evoluz|analiz|memor/i;

export function detectIntent(request: BrainRequest): BrainIntent {
  if (request.intent !== 'auto') {
    return request.intent;
  }

  const text = [request.message, request.decision, request.reason].filter(Boolean).join(' ').trim();

  if (request.decision?.trim() || DECIDE_RE.test(text)) {
    return 'decide';
  }
  if (AWARENESS_RE.test(text)) {
    return 'awareness';
  }
  if (POTENTIAL_RE.test(text)) {
    return 'potential';
  }
  if (LEARN_RE.test(text)) {
    return 'learn';
  }
  if (REFLECT_RE.test(text)) {
    return 'reflect';
  }

  return 'query';
}

export function detectTopics(text: string): ContextTopic[] {
  const input = text.toLowerCase();
  const topics = new Set<ContextTopic>(['identity']);

  const rules: Array<[ContextTopic, RegExp]> = [
    ['finance', /finanz|soldi|etf|invest|cash|liquid|affitt|wrangler|casa|compr|libertà finanzi/i],
    ['freedom', /libert|2036|optional|tempo|status/i],
    ['travel', /viagg|travel|copenaghen|copenhagen|barcelona|naples/i],
    ['creative', /creativ|poem|urees|arte|disegn|visceral|bellezza/i],
    ['reputation', /reputaz|linkedin|medium|pubblic|visibilit|post/i],
    ['projects', /progett|lego|freelance|brand|fronte|dispersion/i],
    ['learning', /impar|skill|legg|read|article/i],
    ['relationships', /contatt|network|person|mentor|relaz/i],
    ['patterns', /pattern|abitudin|ripet|errore|mistake/i]
  ];

  for (const [topic, pattern] of rules) {
    if (pattern.test(input)) {
      topics.add(topic);
    }
  }

  return Array.from(topics);
}
