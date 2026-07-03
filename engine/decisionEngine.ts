import brain from '../memory/giuseppe_brain.json';

export type DecisionInput = {
  decision: string;
  reason: string;
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

const CATEGORY_LABELS: Record<DecisionCategory, string> = {
  real_estate: 'Immobiliare',
  emotional_purchase: 'Acquisto emotivo',
  career: 'Carriera',
  reputation: 'Reputazione',
  creative_project: 'Progetto creativo',
  finance: 'Finanza',
  life_decision: 'Decisione di vita'
};

const CAPITAL_LABELS: Record<CapitalKey, string> = {
  financial: 'Capitale finanziario',
  creative: 'Capitale creativo',
  reputation: 'Capitale reputazionale',
  social: 'Capitale sociale',
  knowledge: 'Capitale conoscenza',
  freedom: 'Capitale libertà'
};

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

function detectHiddenNeed(decision: string, reason: string): string {
  const text = combinedText(decision, reason);
  if (/status|invidia|impression|like|fama|riconosciut|prestig/.test(text)) {
    return 'Validazione esterna e riconoscimento tra persone che rispetti.';
  }
  if (/paur|ansi|sicur|stabilit|incert|control/.test(text)) {
    return 'Sicurezza emotiva e riduzione dell’incertezza.';
  }
  if (/libert|tempo libero|indipend|scegliere se lavor/.test(text)) {
    return 'Più libertà e controllo sul proprio tempo.';
  }
  if (/creat|esprim|bellezz|arte|significat|anima/.test(text)) {
    return 'Espressione creativa autentica e significato personale.';
  }
  if (/soldi|reddito|invest|ricchezz|patrimon|runway/.test(text)) {
    return 'Resilienza finanziaria e accumulo di opzionalità.';
  }
  if (/famigl|amore|relazion|figl|partner/.test(text)) {
    return 'Radici, famiglia e relazioni che reggono nel tempo.';
  }
  if (/noia|stanc|burnout|routine|blocc/.test(text)) {
    return 'Energia rinnovata e uscita da una fase di stagnazione.';
  }
  return 'Chiarezza su cosa vuoi davvero — e perché proprio adesso.';
}

function detectBias(decision: string, reason: string, category: DecisionCategory): string {
  const text = combinedText(decision, reason);
  const biases: string[] = [];

  if (/subito|adesso|urgent|ultim|scadenza|fomo|non perdere/.test(text)) {
    biases.push('urgenza artificiale');
  }
  if (/tutti fanno|trend|viral|hype|moda/.test(text)) {
    biases.push('FOMO e deriva sociale');
  }
  if (/status|invidia|lusso|wrangler|defender|mostrare/.test(text)) {
    biases.push('spesa o mossa guidata dallo status');
  }
  if (/paur|ansi|non voglio|se non/.test(text)) {
    biases.push('decisione guidata dalla paura');
  }
  if (/già investito|oramai|tanto tempo|non posso ferm/.test(text)) {
    biases.push('costo irrecuperabile');
  }
  if (/perfett|infinit|ancora non è|troppo presto per pubblic/.test(text)) {
    biases.push('perfezionismo che ritarda l’azione');
  }
  if (category === 'creative_project' && /industrial|scal|milioni|massa/.test(text)) {
    biases.push('tentazione di industrializzare ciò che dovrebbe restare sacro');
  }
  if (/nuov|altra idea|anche un|in più|parallel/.test(text)) {
    biases.push('dispersione: aprire un nuovo fronte invece di concentrare');
  }

  return biases.length > 0
    ? biases.map(b => b.charAt(0).toUpperCase() + b.slice(1)).join(' · ')
    : 'Nessun bias forte rilevato — resta vigile su impulso e timing.';
}

function evaluateCapitals(
  category: DecisionCategory,
  decision: string,
  reason: string
): Record<CapitalKey, CapitalEvaluation> {
  const text = combinedText(decision, reason);

  const base: Record<CapitalKey, CapitalEvaluation> = {
    financial: { score: 'neutral', note: 'Impatto finanziario da verificare con numeri reali.' },
    creative: { score: 'neutral', note: 'Non altera direttamente il linguaggio creativo.' },
    reputation: { score: 'neutral', note: 'Effetto reputazionale ancora indefinito.' },
    social: { score: 'neutral', note: 'Relazioni e network non chiaramente coinvolti.' },
    knowledge: { score: 'neutral', note: 'Apprendimento marginale rispetto ad altre mosse.' },
    freedom: { score: 'neutral', note: 'Effetto sulla libertà da misurare nel tempo.' }
  };

  const set = (key: CapitalKey, score: 'up' | 'down' | 'neutral', note: string) => {
    base[key] = { score, note };
  };

  switch (category) {
    case 'real_estate':
      set('financial', /invest|anticipo|equity/.test(text) ? 'up' : 'down', 'Casa può consolidare patrimonio ma riduce liquidità e flessibilità.');
      set('freedom', /libert|affitto|scapp/.test(text) ? 'neutral' : 'down', 'Un mutuo lungo riduce opzionalità a breve termine.');
      set('social', 'up', 'Radici a Copenaghen possono rafforzare famiglia e stabilità relazionale.');
      break;
    case 'emotional_purchase':
      set('financial', 'down', 'Acquisto emotivo assorbe cash e riduce runway verso libertà 2036.');
      set('freedom', 'down', 'Status e debito consumano mesi di libertà futura.');
      set('reputation', /wrangler|defender|status/.test(text) ? 'down' : 'neutral', 'Status visibile non equivale a reputazione stimata tra professionisti.');
      break;
    case 'career':
      set('financial', /lego|stabile|aument/.test(text) ? 'up' : 'neutral', 'LEGO resta motore — ogni mossa deve proteggere o amplificare reddito.');
      set('reputation', 'up', 'Carriera ben scelta aumenta credibilità e ownership.');
      set('knowledge', 'up', 'Nuove competenze e network professionali possono crescere.');
      set('freedom', /lasciare|dimission|rischi/.test(text) ? 'down' : 'neutral', 'Cambiare lavoro senza seconda fonte forte riduce libertà.');
      break;
    case 'reputation':
      set('reputation', 'up', 'Pubblicare pensiero vero costruisce capitale reputazionale tra professionisti.');
      set('creative', 'up', 'Mostrare come pensi rafforza il linguaggio personale Giuseppe.');
      set('financial', 'neutral', 'Reputazione è investimento a medio termine, non cash immediato.');
      set('freedom', 'up', 'Visibilità stimata apre opzioni senza dipendere da un solo datore.');
      break;
    case 'creative_project':
      set('creative', 'up', 'Progetto creativo autentico alimenta capitale creativo sacro.');
      set('reputation', /urees|visceral|qualit/.test(text) ? 'up' : 'neutral', 'Micro-versione eccellente può diventare asset reputazionale.');
      set('financial', /industrial|scal|vendere mil/.test(text) ? 'down' : 'neutral', 'Industrializzare troppo presto può tradire il valore del progetto.');
      set('freedom', 'neutral', 'Arte sacra richiede tempo — non deve diventare gabbia operativa.');
      break;
    case 'finance':
      set('financial', 'up', 'Investire con disciplina compra mesi di libertà futura.');
      set('freedom', 'up', 'ETF automatici e fondo emergenza aumentano opzionalità 2036.');
      set('knowledge', 'up', 'Capacità finanziaria è capitale conoscenza permanente.');
      set('reputation', 'neutral', 'Finanza personale resta privata finché non diventa contenuto utile.');
      break;
    default:
      set('freedom', /libert|verità|amore/.test(text) ? 'up' : 'neutral', 'Valuta se la mossa aumenta libertà, verità o amore.');
      set('social', /famigl|amore|relazion/.test(text) ? 'up' : 'neutral', 'Decisioni di vita toccano relazioni e radici.');
      set('creative', /creat|significat/.test(text) ? 'up' : 'neutral', 'Cerca connessione con ciò che conta davvero creare.');
      break;
  }

  return base;
}

function buildBetterVersion(category: DecisionCategory, decision: string, reason: string): string {
  const text = combinedText(decision, reason);
  const snippets: Record<DecisionCategory, string> = {
    real_estate: `Invece di "${decision.trim()}", compra casa solo quando anticipo, runway e investimenti automatici restano intatti — e la casa aumenta libertà, non solo toglie l’affitto.`,
    emotional_purchase: `Invece di "${decision.trim()}", aspetta 90 giorni, fissa un budget massimo reversibile e verifica che non tocchi fondo emergenza né piano ETF.`,
    career: `Invece di "${decision.trim()}", scegli la mossa che aumenta ownership e reputazione dentro l’ecosistema LEGO/Giuseppe — senza lasciare stabilità senza seconda fonte.`,
    reputation: `Invece di "${decision.trim()}", pubblica una versione imperfetta ma vera che mostra come pensi — rivolta a professionisti che vuoi rispettino il tuo lavoro.`,
    creative_project: `Invece di "${decision.trim()}", realizza una micro-versione di altissima qualità che resta sacra — non industrializzare ciò che deve conservare identità.`,
    finance: `Invece di "${decision.trim()}", prima fondo emergenza poi ETF automatico — misura mesi di libertà, non solo rendimento.`,
    life_decision: `Invece di "${decision.trim()}", trova la versione più piccola e reversibile che aumenta libertà, verità o amore — e aspetta se nasce da ansia.`
  };

  if (/subito|urgent/.test(text)) {
    return `${snippets[category]} Non agire per urgenza: il motivo dichiarato ("${reason.trim() || 'non chiarito'}") merita 48 ore di distanza emotiva.`;
  }
  return snippets[category];
}

function buildNextAction(category: DecisionCategory, decision: string, bias: string): string {
  const actions: Record<DecisionCategory, string> = {
    real_estate: 'Calcola anticipo minimo, costo mensile totale e mesi di runway persi — poi confronta con 24 mesi di affitto consapevole.',
    emotional_purchase: 'Scrivi prezzo massimo, data di revisione a 90 giorni e condizione di uscita prima di aprire qualsiasi trattativa.',
    career: 'Elenca cosa questa mossa aggiunge a LEGO, Brand Giuseppe e reddito — se non rafforza almeno due, congela.',
    reputation: 'Bozza in 30 minuti un post che spiega un problema reale che hai risolto — pubblica entro questa settimana.',
    creative_project: 'Definisci la micro-versione completabile in 2 settimane con qualità eccellente — nient’altro finché non è finita.',
    finance: 'Imposta o aumenta oggi un trasferimento automatico verso ETF o fondo emergenza — importo fisso, niente trading.',
    life_decision: 'Scrivi su carta: questa scelta aumenta libertà, verità o amore? Se non aumenta almeno uno, aspetta 7 giorni.'
  };

  if (bias.toLowerCase().includes('dispersione')) {
    return 'Congela ogni nuovo fronte per 30 giorni e torna al progetto attivo con priorità più alta.';
  }
  if (bias.toLowerCase().includes('paura')) {
    return `Prima di decidere su "${decision.trim()}", descrivi la peggior conseguenza realistica e il piano se accadesse — poi rivaluta.`;
  }
  return actions[category];
}

function buildCounsellors(
  input: DecisionInput,
  category: DecisionCategory,
  hiddenNeed: string,
  bias: string,
  capitals: Record<CapitalKey, CapitalEvaluation>,
  betterVersion: string
): DecisionResult['counsellors'] {
  const { decision, reason } = input;
  const reasonText = reason.trim() || 'non chiarito';
  const cash = brain.finance.cash_dkk.toLocaleString('it-IT');

  const freedomNote = capitals.freedom.note;
  const financialNote = capitals.financial.note;

  return {
    CEO2036: `Verdetto 2036 su "${decision.trim()}": procedi solo se aumenta libertà a 10 anni. ${betterVersion.split('.')[0]}. Il motivo "${reasonText}" punta a: ${hiddenNeed.toLowerCase()} — valido solo se non è distrazione dal North Star.`,
    CFO: `Con ${cash} DKK di liquidità, questa mossa ${capitals.financial.score === 'down' ? 'riduce' : capitals.financial.score === 'up' ? 'può aumentare' : 'non chiarisce'} il tuo capitale finanziario. ${financialNote} Compra mesi di libertà, non status.`,
    Strategist: `Nel sistema Giuseppe (LEGO, Brand, UREES, Visceral), "${decision.trim()}" ${category === 'creative_project' || category === 'reputation' ? 'può rafforzare l’ecosistema se resta concentrata' : category === 'emotional_purchase' ? 'apre un fronte emotivo che distrae dalle priorità' : 'va valutata contro il rischio di dispersione'}. ${bias.includes('dispersione') ? 'Pattern di dispersione rilevato — congela nuove idee.' : 'Non aprire un nuovo fronte senza chiudere un ciclo.'}`,
    CreativeDirector: `${category === 'creative_project' || category === 'reputation' ? `"${decision.trim()}" può alimentare il linguaggio personale Giuseppe se resta vero e non performativo.` : `"${decision.trim()}" non è mossa creativa primaria — chiediti se aumenta significato o solo rumore.`} ${capitals.creative.note} Una cosa eccezionale vale più di dieci mediocri.`,
    Psychologist: `Motivo dichiarato: "${reasonText}". Sotto la superficie cerco: ${hiddenNeed} Bias rilevato: ${bias.toLowerCase()} ${reason.length < 12 ? '— il motivo è troppo corto: potresti non aver ancora nominato il bisogno vero.' : ''}`,
    Mentor: `La scelta deve restare connessa al proposito spirituale: ${brain.north_star.toLowerCase()} Questa decisione ${capitals.freedom.score === 'up' ? 'sembra allineata alla libertà' : capitals.freedom.score === 'down' ? 'rischia di comprimere la libertà' : 'richiede discernimento'}. ${freedomNote}`
  };
}

export function runDecisionEngine(input: DecisionInput): DecisionResult {
  const decision = input.decision.trim();
  const reason = input.reason.trim();
  const category = classifyDecision(`${decision} ${reason}`);
  const hiddenNeed = detectHiddenNeed(decision, reason);
  const bias = detectBias(decision, reason, category);
  const capitals = evaluateCapitals(category, decision, reason);
  const betterVersion = buildBetterVersion(category, decision, reason);
  const nextAction = buildNextAction(category, decision, bias);
  const counsellors = buildCounsellors(
    { decision, reason },
    category,
    hiddenNeed,
    bias,
    capitals,
    betterVersion
  );

  return {
    category,
    categoryLabel: CATEGORY_LABELS[category],
    hiddenNeed,
    bias,
    capitals,
    betterVersion,
    nextAction,
    counsellors
  };
}

export function getCapitalLabel(key: CapitalKey): string {
  return CAPITAL_LABELS[key];
}

export const COUNSELLOR_LABELS: Record<keyof DecisionResult['counsellors'], string> = {
  CEO2036: 'CEO 2036',
  CFO: 'CFO',
  Strategist: 'Strategist',
  CreativeDirector: 'Creative Director',
  Psychologist: 'Psychologist',
  Mentor: 'Mentor'
};
