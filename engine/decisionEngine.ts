import brain from '../memory/giuseppe_brain.json';
import { liquidityPhrase } from '../lib/publicFinance';
import {
  BETTER_VERSION,
  BIAS_DEFAULT,
  DISPERSION_ACTION,
  FEAR_ACTION,
  HIDDEN_NEED_DEFAULT,
  NEXT_ACTION,
  URGENCY_SUFFIX
} from './content/decisionStrings';
import { resolveLocale, pickLocale, type AppLocale } from '../lib/i18n/locale';
import { capitalLabel, decisionCategoryLabel } from './content/decisionLabels';

export type DecisionInput = {
  decision: string;
  reason: string;
  locale?: 'it' | 'en';
};

export type DecisionCategory =
  | 'real_estate'
  | 'emotional_purchase'
  | 'career'
  | 'reputation'
  | 'creative_project'
  | 'finance'
  | 'life_decision';

export type CapitalKey =
  | 'financial'
  | 'creative'
  | 'reputation'
  | 'social'
  | 'knowledge'
  | 'freedom';

export type CapitalEvaluation = {
  score: 'up' | 'down' | 'neutral';
  note: string;
};

export type DecisionResult = {
  category: DecisionCategory;
  categoryLabel: string;
  hiddenNeed: string;
  bias: string;
  capitals: Record<CapitalKey, CapitalEvaluation>;
  betterVersion: string;
  nextAction: string;
  counsellors: {
    CEO2036: string;
    CFO: string;
    Strategist: string;
    CreativeDirector: string;
    Psychologist: string;
    Mentor: string;
  };
};

function n(locale: AppLocale, it: string, en: string): string {
  return pickLocale(locale, it, en);
}

function combinedText(decision: string, reason: string) {
  return `${decision} ${reason}`.toLowerCase();
}

export function classifyDecision(text: string): DecisionCategory {
  const t = text.toLowerCase();

  if (t.includes('casa') || t.includes('house') || t.includes('apartment') || t.includes('affitto') || t.includes('mutuo')) {
    return 'real_estate';
  }
  if (
    t.includes('post') ||
    t.includes('linkedin') ||
    t.includes('medium') ||
    t.includes('instagram') ||
    t.includes('pubblic')
  ) {
    return 'reputation';
  }
  if (/\b(wrangler|defender|macchina|auto|car)\b/.test(t)) {
    return 'emotional_purchase';
  }
  if (t.includes('lego') || t.includes('lavoro') || t.includes('job') || t.includes('freelance') || t.includes('dimission')) {
    return 'career';
  }
  if (t.includes('urees') || t.includes('visceral') || t.includes('arte') || t.includes('poem') || t.includes('creativ')) {
    return 'creative_project';
  }
  if (t.includes('invest') || t.includes('etf') || t.includes('soldi') || t.includes('money') || t.includes('risparm')) {
    return 'finance';
  }
  return 'life_decision';
}

function detectHiddenNeed(decision: string, reason: string, locale: AppLocale): string {
  const text = combinedText(decision, reason);
  if (/status|invidia|impression|like|fama|riconosciut|prestig/.test(text)) {
    return n(locale, 'Validazione esterna e riconoscimento tra persone che rispetti.', 'External validation and recognition among people you respect.');
  }
  if (/paur|ansi|sicur|stabilit|incert|control|fear|anxiet|secur/.test(text)) {
    return n(locale, "Sicurezza emotiva e riduzione dell'incertezza.", 'Emotional safety and reducing uncertainty.');
  }
  if (/libert|tempo libero|indipend|scegliere se lavor|freedom/.test(text)) {
    return n(locale, 'Più libertà e controllo sul proprio tempo.', 'More freedom and control over your own time.');
  }
  if (/creat|esprim|bellezz|arte|significat|anima/.test(text)) {
    return n(locale, 'Espressione creativa autentica e significato personale.', 'Authentic creative expression and personal meaning.');
  }
  if (/soldi|reddito|invest|richezz|patrimon|runway|money|income/.test(text)) {
    return n(locale, 'Resilienza finanziaria e accumulo di opzionalità.', 'Financial resilience and building optionality.');
  }
  if (/famigl|amore|relazion|figl|partner|family|love/.test(text)) {
    return n(locale, 'Radici, famiglia e relazioni che reggono nel tempo.', 'Roots, family, and relationships that last.');
  }
  if (/noia|stanc|burnout|routine|blocc|bored|tired/.test(text)) {
    return n(locale, 'Energia rinnovata e uscita da una fase di stagnazione.', 'Renewed energy and exit from stagnation.');
  }
  return HIDDEN_NEED_DEFAULT[locale];
}

function detectBias(decision: string, reason: string, category: DecisionCategory, locale: AppLocale): string {
  const text = combinedText(decision, reason);
  const biases: string[] = [];

  if (/subito|adesso|urgent|ultim|scadenza|fomo|non perdere/.test(text)) {
    biases.push(n(locale, 'urgenza artificiale', 'artificial urgency'));
  }
  if (/tutti fanno|trend|viral|hype|moda/.test(text)) {
    biases.push(n(locale, 'FOMO e deriva sociale', 'FOMO and social drift'));
  }
  if (/status|invidia|lusso|wrangler|defender|mostrare/.test(text)) {
    biases.push(n(locale, 'spesa o mossa guidata dallo status', 'status-driven spend or move'));
  }
  if (/paur|ansi|non voglio|se non|fear|anxiet/.test(text)) {
    biases.push(n(locale, 'decisione guidata dalla paura', 'fear-driven decision'));
  }
  if (/già investito|oramai|tanto tempo|non posso ferm|sunk/.test(text)) {
    biases.push(n(locale, 'costo irrecuperabile', 'sunk cost'));
  }
  if (/perfett|infinit|ancora non è|troppo presto per pubblic/.test(text)) {
    biases.push(n(locale, 'perfezionismo che ritarda l\'azione', 'perfectionism delaying action'));
  }
  if (category === 'creative_project' && /industrial|scal|milioni|massa/.test(text)) {
    biases.push(n(locale, 'tentazione di industrializzare ciò che dovrebbe restare sacro', 'temptation to industrialize what should stay sacred'));
  }
  if (/nuov|altra idea|anche un|in più|parallel|new idea/.test(text)) {
    biases.push(n(locale, 'dispersione: aprire un nuovo fronte invece di concentrare', 'dispersion: opening a new front instead of concentrating'));
  }

  return biases.length > 0
    ? biases.map(b => b.charAt(0).toUpperCase() + b.slice(1)).join(' · ')
    : BIAS_DEFAULT[locale];
}

function evaluateCapitals(
  category: DecisionCategory,
  decision: string,
  reason: string,
  locale: AppLocale
): Record<CapitalKey, CapitalEvaluation> {
  const text = combinedText(decision, reason);

  const base: Record<CapitalKey, CapitalEvaluation> = {
    financial: { score: 'neutral', note: n(locale, 'Impatto finanziario da verificare con numeri reali.', 'Financial impact to verify with real numbers.') },
    creative: { score: 'neutral', note: n(locale, 'Non altera direttamente il linguaggio creativo.', 'Does not directly alter creative language.') },
    reputation: { score: 'neutral', note: n(locale, 'Effetto reputazionale ancora indefinito.', 'Reputational effect still undefined.') },
    social: { score: 'neutral', note: n(locale, 'Relazioni e network non chiaramente coinvolti.', 'Relationships and network not clearly involved.') },
    knowledge: { score: 'neutral', note: n(locale, 'Apprendimento marginale rispetto ad altre mosse.', 'Learning marginal compared to other moves.') },
    freedom: { score: 'neutral', note: n(locale, 'Effetto sulla libertà da misurare nel tempo.', 'Effect on freedom to measure over time.') }
  };

  const set = (key: CapitalKey, score: 'up' | 'down' | 'neutral', note: string) => {
    base[key] = { score, note };
  };

  switch (category) {
    case 'real_estate':
      set('financial', /invest|anticipo|equity/.test(text) ? 'up' : 'down', n(locale, 'Casa può consolidare patrimonio ma riduce liquidità e flessibilità.', 'A home can consolidate wealth but reduces liquidity and flexibility.'));
      set('freedom', /libert|affitto|scapp/.test(text) ? 'neutral' : 'down', n(locale, 'Un mutuo lungo riduce opzionalità a breve termine.', 'A long mortgage reduces short-term optionality.'));
      set('social', 'up', n(locale, 'Radici a Copenaghen possono rafforzare famiglia e stabilità relazionale.', 'Roots in Copenhagen can strengthen family and relational stability.'));
      break;
    case 'emotional_purchase':
      set('financial', 'down', n(locale, 'Acquisto emotivo assorbe cash e riduce runway verso libertà 2036.', 'Emotional purchase absorbs cash and reduces runway toward freedom 2036.'));
      set('freedom', 'down', n(locale, 'Status e debito consumano mesi di libertà futura.', 'Status and debt consume months of future freedom.'));
      set('reputation', /wrangler|defender|status/.test(text) ? 'down' : 'neutral', n(locale, 'Status visibile non equivale a reputazione stimata tra professionisti.', 'Visible status does not equal esteem among professionals.'));
      break;
    case 'career':
      set('financial', /lego|stabile|aument/.test(text) ? 'up' : 'neutral', n(locale, 'LEGO resta motore — ogni mossa deve proteggere o amplificare reddito.', 'LEGO remains the engine — every move must protect or amplify income.'));
      set('reputation', 'up', n(locale, 'Carriera ben scelta aumenta credibilità e ownership.', 'A well-chosen career move increases credibility and ownership.'));
      set('knowledge', 'up', n(locale, 'Nuove competenze e network professionali possono crescere.', 'New skills and professional networks can grow.'));
      set('freedom', /lasciare|dimission|rischi/.test(text) ? 'down' : 'neutral', n(locale, 'Cambiare lavoro senza seconda fonte forte riduce libertà.', 'Changing jobs without a strong second income source reduces freedom.'));
      break;
    case 'reputation':
      set('reputation', 'up', n(locale, 'Pubblicare pensiero vero costruisce capitale reputazionale tra professionisti.', 'Publishing true thinking builds reputation capital among professionals.'));
      set('creative', 'up', n(locale, 'Mostrare come pensi rafforza il linguaggio personale Giuseppe.', 'Showing how you think strengthens Giuseppe personal language.'));
      set('financial', 'neutral', n(locale, 'Reputazione è investimento a medio termine, non cash immediato.', 'Reputation is a medium-term investment, not immediate cash.'));
      set('freedom', 'up', n(locale, 'Visibilità stimata apre opzioni senza dipendere da un solo datore.', 'Esteemed visibility opens options without depending on one employer.'));
      break;
    case 'creative_project':
      set('creative', 'up', n(locale, 'Progetto creativo autentico alimenta capitale creativo sacro.', 'Authentic creative project feeds sacred creative capital.'));
      set('reputation', /urees|visceral|qualit/.test(text) ? 'up' : 'neutral', n(locale, 'Micro-versione eccellente può diventare asset reputazionale.', 'An excellent micro-version can become a reputational asset.'));
      set('financial', /industrial|scal|vendere mil/.test(text) ? 'down' : 'neutral', n(locale, 'Industrializzare troppo presto può tradire il valore del progetto.', 'Industrializing too early can betray the project value.'));
      set('freedom', 'neutral', n(locale, 'Arte sacra richiede tempo — non deve diventare gabbia operativa.', 'Sacred art takes time — it must not become an operational cage.'));
      break;
    case 'finance':
      set('financial', 'up', n(locale, 'Investire con disciplina compra mesi di libertà futura.', 'Investing with discipline buys months of future freedom.'));
      set('freedom', 'up', n(locale, 'ETF automatici e fondo emergenza aumentano opzionalità 2036.', 'Automatic ETFs and emergency fund increase 2036 optionality.'));
      set('knowledge', 'up', n(locale, 'Capacità finanziaria è capitale conoscenza permanente.', 'Financial capability is permanent knowledge capital.'));
      set('reputation', 'neutral', n(locale, 'Finanza personale resta privata finché non diventa contenuto utile.', 'Personal finance stays private until it becomes useful content.'));
      break;
    default:
      set('freedom', /libert|verità|amore|truth|love/.test(text) ? 'up' : 'neutral', n(locale, 'Valuta se la mossa aumenta libertà, verità o amore.', 'Assess whether the move increases freedom, truth, or love.'));
      set('social', /famigl|amore|relazion|family|love/.test(text) ? 'up' : 'neutral', n(locale, 'Decisioni di vita toccano relazioni e radici.', 'Life decisions touch relationships and roots.'));
      set('creative', /creat|significat/.test(text) ? 'up' : 'neutral', n(locale, 'Cerca connessione con ciò che conta davvero creare.', 'Seek connection with what truly matters to create.'));
      break;
  }

  return base;
}

function buildBetterVersion(category: DecisionCategory, decision: string, reason: string, locale: AppLocale): string {
  const text = combinedText(decision, reason);
  const snippet = BETTER_VERSION[locale][category](decision.trim());
  if (/subito|urgent/.test(text)) {
    return `${snippet}${URGENCY_SUFFIX[locale](reason.trim())}`;
  }
  return snippet;
}

function buildNextAction(category: DecisionCategory, decision: string, bias: string, locale: AppLocale): string {
  const lower = bias.toLowerCase();
  if (lower.includes('dispersione') || lower.includes('dispersion')) {
    return DISPERSION_ACTION[locale];
  }
  if (lower.includes('paura') || lower.includes('fear')) {
    return FEAR_ACTION[locale](decision.trim());
  }
  return NEXT_ACTION[locale][category];
}

function buildCounsellors(
  input: DecisionInput,
  category: DecisionCategory,
  hiddenNeed: string,
  bias: string,
  capitals: Record<CapitalKey, CapitalEvaluation>,
  betterVersion: string,
  locale: AppLocale
): DecisionResult['counsellors'] {
  const { decision, reason } = input;
  const reasonText = reason.trim() || n(locale, 'non chiarito', 'not clarified');
  const liquidity = liquidityPhrase();
  const freedomNote = capitals.freedom.note;
  const financialNote = capitals.financial.note;
  const trimmed = decision.trim();
  const dispersion = bias.toLowerCase().includes('dispersione') || bias.toLowerCase().includes('dispersion');

  return {
    CEO2036: n(
      locale,
      `Verdetto 2036 su "${trimmed}": procedi solo se aumenta libertà a 10 anni. ${betterVersion.split('.')[0]}. Il motivo "${reasonText}" punta a: ${hiddenNeed.toLowerCase()} — valido solo se non è distrazione dal North Star.`,
      `2036 verdict on "${trimmed}": proceed only if it increases freedom in 10 years. ${betterVersion.split('.')[0]}. The reason "${reasonText}" points to: ${hiddenNeed.toLowerCase()} — valid only if it is not distraction from the North Star.`
    ),
    CFO: n(
      locale,
      `${liquidity}, questa mossa ${capitals.financial.score === 'down' ? 'riduce' : capitals.financial.score === 'up' ? 'può aumentare' : 'non chiarisce'} il tuo capitale finanziario. ${financialNote} Compra mesi di libertà, non status.`,
      `${liquidity}, this move ${capitals.financial.score === 'down' ? 'reduces' : capitals.financial.score === 'up' ? 'may increase' : 'does not clarify'} your financial capital. ${financialNote} Buy months of freedom, not status.`
    ),
    Strategist: n(
      locale,
      `Nel sistema Giuseppe (LEGO, Brand, UREES, Visceral), "${trimmed}" ${category === 'creative_project' || category === 'reputation' ? 'può rafforzare l\'ecosistema se resta concentrata' : category === 'emotional_purchase' ? 'apre un fronte emotivo che distrae dalle priorità' : 'va valutata contro il rischio di dispersione'}. ${dispersion ? 'Pattern di dispersione rilevato — congela nuove idee.' : 'Non aprire un nuovo fronte senza chiudere un ciclo.'}`,
      `In the Giuseppe system (LEGO, Brand, UREES, Visceral), "${trimmed}" ${category === 'creative_project' || category === 'reputation' ? 'can strengthen the ecosystem if it stays focused' : category === 'emotional_purchase' ? 'opens an emotional front that distracts from priorities' : 'must be weighed against dispersion risk'}. ${dispersion ? 'Dispersion pattern detected — freeze new ideas.' : 'Do not open a new front without closing a cycle.'}`
    ),
    CreativeDirector: n(
      locale,
      `${category === 'creative_project' || category === 'reputation' ? `"${trimmed}" può alimentare il linguaggio personale Giuseppe se resta vero e non performativo.` : `"${trimmed}" non è mossa creativa primaria — chiediti se aumenta significato o solo rumore.`} ${capitals.creative.note} Una cosa eccezionale vale più di dieci mediocri.`,
      `${category === 'creative_project' || category === 'reputation' ? `"${trimmed}" can feed Giuseppe personal language if it stays true and not performative.` : `"${trimmed}" is not a primary creative move — ask if it increases meaning or only noise.`} ${capitals.creative.note} One exceptional thing beats ten mediocre ones.`
    ),
    Psychologist: n(
      locale,
      `Motivo dichiarato: "${reasonText}". Sotto la superficie cerco: ${hiddenNeed} Bias rilevato: ${bias.toLowerCase()} ${reason.length < 12 ? '— il motivo è troppo corto: potresti non aver ancora nominato il bisogno vero.' : ''}`,
      `Stated reason: "${reasonText}". Beneath the surface I look for: ${hiddenNeed} Bias detected: ${bias.toLowerCase()} ${reason.length < 12 ? '— the reason is too short: you may not have named the real need yet.' : ''}`
    ),
    Mentor: n(
      locale,
      `La scelta deve restare connessa al proposito spirituale: ${brain.north_star.toLowerCase()} Questa decisione ${capitals.freedom.score === 'up' ? 'sembra allineata alla libertà' : capitals.freedom.score === 'down' ? 'rischia di comprimere la libertà' : 'richiede discernimento'}. ${freedomNote}`,
      `The choice must stay connected to spiritual purpose: ${brain.north_star.toLowerCase()} This decision ${capitals.freedom.score === 'up' ? 'seems aligned with freedom' : capitals.freedom.score === 'down' ? 'risks compressing freedom' : 'requires discernment'}. ${freedomNote}`
    )
  };
}

export function runDecisionEngine(input: DecisionInput): DecisionResult {
  const locale = resolveLocale(input.locale);
  const decision = input.decision.trim();
  const reason = input.reason.trim();
  const category = classifyDecision(`${decision} ${reason}`);
  const hiddenNeed = detectHiddenNeed(decision, reason, locale);
  const bias = detectBias(decision, reason, category, locale);
  const capitals = evaluateCapitals(category, decision, reason, locale);
  const betterVersion = buildBetterVersion(category, decision, reason, locale);
  const nextAction = buildNextAction(category, decision, bias, locale);
  const counsellors = buildCounsellors(
    { decision, reason },
    category,
    hiddenNeed,
    bias,
    capitals,
    betterVersion,
    locale
  );

  return {
    category,
    categoryLabel: decisionCategoryLabel(category, locale),
    hiddenNeed,
    bias,
    capitals,
    betterVersion,
    nextAction,
    counsellors
  };
}

export function getCapitalLabel(key: CapitalKey, locale: 'it' | 'en' = 'it'): string {
  return capitalLabel(key, resolveLocale(locale));
}

export const COUNSELLOR_LABELS: Record<keyof DecisionResult['counsellors'], string> = {
  CEO2036: 'CEO 2036',
  CFO: 'CFO',
  Strategist: 'Strategist',
  CreativeDirector: 'Creative Director',
  Psychologist: 'Psychologist',
  Mentor: 'Mentor'
};
