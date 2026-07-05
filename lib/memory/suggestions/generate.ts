import { pickLocale, resolveLocale, type AppLocale } from '../../i18n/locale';
import { loadBrain } from '../../brain/memory/store';
import { MEMORY_MEDIA_CATALOG } from './catalog';
import type { MemoryMediaCatalogItem, MemoryMediaSuggestion, MemorySuggestionsResponse } from './types';

const TAG_WEIGHT = 1;
const PROJECT_WEIGHT = 2;
const GOAL_WEIGHT = 1.5;

type InterestWeights = Map<string, number>;

function bumpTag(weights: InterestWeights, tag: string, amount: number): void {
  weights.set(tag, (weights.get(tag) ?? 0) + amount);
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .split(/[^a-z0-9]+/i)
    .filter(Boolean);
}

function inferTagsFromText(text: string, weights: InterestWeights, amount: number): void {
  const tokens = tokenize(text);
  const joined = tokens.join(' ');

  if (/lego|play|brand|branding|storytell/.test(joined)) {
    bumpTag(weights, 'lego', amount);
    bumpTag(weights, 'branding', amount);
    bumpTag(weights, 'play', amount);
    bumpTag(weights, 'storytelling', amount);
  }
  if (/design|creative|direzione|art/.test(joined)) {
    bumpTag(weights, 'design', amount);
    bumpTag(weights, 'creative', amount);
    bumpTag(weights, 'art', amount);
  }
  if (/scritt|medium|linkedin|pensier|pubblic/.test(joined)) {
    bumpTag(weights, 'writing', amount);
    bumpTag(weights, 'brand', amount);
  }
  if (/finanz|invest|libert|reddito|cash|2036|tempo/.test(joined)) {
    bumpTag(weights, 'finance', amount);
    bumpTag(weights, 'freedom', amount);
    bumpTag(weights, 'time', amount);
  }
  if (/decision|concentr|focus|dispersion|progett/.test(joined)) {
    bumpTag(weights, 'focus', amount);
    bumpTag(weights, 'decisions', amount);
    bumpTag(weights, 'patterns', amount);
  }
  if (/reput|network|ownership|carriera|career/.test(joined)) {
    bumpTag(weights, 'brand', amount);
    bumpTag(weights, 'freedom', amount);
  }
  if (/verita|bellezza|filosof|poem|urees/.test(joined)) {
    bumpTag(weights, 'philosophy', amount);
    bumpTag(weights, 'art', amount);
    bumpTag(weights, 'creative', amount);
  }
}

async function buildInterestWeights(): Promise<InterestWeights> {
  const brain = await loadBrain();
  const weights: InterestWeights = new Map();

  for (const value of brain.values) {
    inferTagsFromText(value, weights, TAG_WEIGHT);
  }

  for (const skill of brain.skills) {
    inferTagsFromText(skill, weights, TAG_WEIGHT);
  }

  for (const pattern of brain.patterns) {
    inferTagsFromText(pattern, weights, TAG_WEIGHT);
  }

  for (const goal of [...brain.creative_goals, ...brain.career_goals, ...brain.finance.main_goals]) {
    inferTagsFromText(goal, weights, GOAL_WEIGHT);
  }

  for (const priority of brain.priorities) {
    inferTagsFromText(priority, weights, GOAL_WEIGHT);
  }

  for (const [name, project] of Object.entries(brain.projects)) {
    inferTagsFromText(`${name} ${project.role}`, weights, PROJECT_WEIGHT);
  }

  for (const item of brain.reading_queue) {
    inferTagsFromText(item, weights, TAG_WEIGHT);
  }

  return weights;
}

function scoreItem(item: MemoryMediaCatalogItem, weights: InterestWeights): number {
  let score = 0;
  for (const tag of item.tags) {
    score += weights.get(tag) ?? 0;
  }
  return score;
}

function reasonForItem(item: MemoryMediaCatalogItem, locale: AppLocale): string {
  const tag = item.tags[0] ?? 'creative';

  const reasons: Record<string, { it: string; en: string }> = {
    design: {
      it: 'Allinea design e direzione creativa con ciò che stai costruendo.',
      en: 'Aligns design and creative direction with what you are building.'
    },
    branding: {
      it: 'Rafforza storytelling e marca personale — vicino a LEGO e Brand Giuseppe.',
      en: 'Strengthens storytelling and personal brand — close to LEGO and Brand Giuseppe.'
    },
    writing: {
      it: 'Supporta il pensiero pubblico su Medium e LinkedIn.',
      en: 'Supports public thinking on Medium and LinkedIn.'
    },
    finance: {
      it: 'Collegato alla libertà 2036 e al capitale che stai accumulando.',
      en: 'Connected to 2036 freedom and the capital you are building.'
    },
    freedom: {
      it: 'Parla di tempo, scelta e traiettoria — come la tua North Star.',
      en: 'Speaks to time, choice, and trajectory — like your North Star.'
    },
    focus: {
      it: 'Aiuta a contrastare la dispersione quando apri troppi fronti.',
      en: 'Helps counter dispersion when you open too many fronts.'
    },
    creative: {
      it: 'Nutre Visceral Poems, UREES e il lavoro creativo sacro.',
      en: 'Feeds Visceral Poems, UREES, and sacred creative work.'
    },
    decisions: {
      it: 'Affina come decidi sotto pressione e a lungo orizzonte.',
      en: 'Sharpens how you decide under pressure and on long horizons.'
    },
    art: {
      it: 'Ti avvicina a verità e bellezza nel lavoro visibile.',
      en: 'Moves you toward truth and beauty in visible work.'
    },
    lego: {
      it: 'Risona con play, branding e il tuo ecosistema LEGO.',
      en: 'Resonates with play, branding, and your LEGO ecosystem.'
    },
    philosophy: {
      it: 'Profondità lenta per chi pensa a decade, non a settimane.',
      en: 'Slow depth for someone thinking in decades, not weeks.'
    },
    storytelling: {
      it: 'Per chi deve spiegare idee complesse con chiarezza umana.',
      en: 'For explaining complex ideas with human clarity.'
    },
    patterns: {
      it: 'Legge i pattern prima che diventino abitudine.',
      en: 'Reads patterns before they become habit.'
    },
    time: {
      it: 'Compra tempo — una delle tue regole costituzionali.',
      en: 'Buy time — one of your constitutional rules.'
    },
    play: {
      it: 'Play serio: design, LEGO e futuro del gioco.',
      en: 'Serious play: design, LEGO, and the future of play.'
    },
    brand: {
      it: 'Il nome Giuseppe è la marca madre — questo lo alimenta.',
      en: 'Giuseppe is the parent brand — this feeds it.'
    },
    product: {
      it: 'Product thinking per decisioni concretamente utili.',
      en: 'Product thinking for concretely useful decisions.'
    },
    learning: {
      it: 'Apprendimento composto per la traiettoria, non per la curiosità vuota.',
      en: 'Compound learning for trajectory, not empty curiosity.'
    }
  };

  const copy = reasons[tag] ?? reasons.creative;
  return pickLocale(locale, copy.it, copy.en);
}

function dayOffsetSeed(date = new Date()): number {
  const key = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  let hash = 0;
  for (let index = 0; index < key.length; index += 1) {
    hash = (hash * 31 + key.charCodeAt(index)) % 9973;
  }
  return hash;
}

function pickBalancedSuggestions(
  ranked: Array<{ item: MemoryMediaCatalogItem; score: number }>,
  locale: AppLocale,
  limit = 5
): MemoryMediaSuggestion[] {
  const books = ranked.filter(entry => entry.item.type === 'book');
  const podcasts = ranked.filter(entry => entry.item.type === 'podcast');
  const seed = dayOffsetSeed();
  const picked: MemoryMediaCatalogItem[] = [];
  const used = new Set<string>();

  function takeFrom(pool: typeof ranked, count: number): void {
    if (count <= 0 || pool.length === 0) {
      return;
    }
    const start = seed % pool.length;
    let added = 0;
    for (let offset = 0; offset < pool.length && added < count; offset += 1) {
      const entry = pool[(start + offset) % pool.length];
      if (!entry || used.has(entry.item.id)) {
        continue;
      }
      used.add(entry.item.id);
      picked.push(entry.item);
      added += 1;
    }
  }

  takeFrom(books, 3);
  takeFrom(podcasts, 2);

  for (const entry of ranked) {
    if (picked.length >= limit) {
      break;
    }
    if (used.has(entry.item.id)) {
      continue;
    }
    used.add(entry.item.id);
    picked.push(entry.item);
  }

  return picked.slice(0, limit).map(item => ({
    id: item.id,
    type: item.type,
    title: item.title,
    author: item.author,
    reason: reasonForItem(item, locale)
  }));
}

export async function generateMemorySuggestions(localeInput?: AppLocale): Promise<MemorySuggestionsResponse> {
  const locale = resolveLocale(localeInput);
  const weights = await buildInterestWeights();

  const ranked = MEMORY_MEDIA_CATALOG.map(item => ({
    item,
    score: scoreItem(item, weights)
  })).sort((a, b) => b.score - a.score || a.item.title.localeCompare(b.item.title));

  return {
    items: pickBalancedSuggestions(ranked, locale),
    generatedAt: new Date().toISOString(),
    source: 'local'
  };
}
