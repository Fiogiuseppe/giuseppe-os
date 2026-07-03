import brain from '../memory/giuseppe_brain.json';

export type DecisionInput = {
  decision: string;
  reason: string;
};

function classifyDecision(text: string) {
  const t = text.toLowerCase();
  if (t.includes('casa') || t.includes('house') || t.includes('apartment')) return 'real_estate';
  if (t.includes('wrangler') || t.includes('car') || t.includes('macchina')) return 'emotional_purchase';
  if (t.includes('lego') || t.includes('job') || t.includes('lavoro')) return 'career';
  if (t.includes('post') || t.includes('linkedin') || t.includes('medium') || t.includes('instagram')) return 'reputation';
  if (t.includes('urees') || t.includes('visceral') || t.includes('arte')) return 'creative_project';
  if (t.includes('invest') || t.includes('etf') || t.includes('money')) return 'finance';
  return 'life_decision';
}

export function runDecisionEngine(input: DecisionInput) {
  const category = classifyDecision(input.decision);

  const common = {
    category,
    northStar: brain.north_star,
    mission: brain.mission_2036,
    decision: input.decision,
    reason: input.reason
  };

  const alternatives: Record<string, string[]> = {
    real_estate: [
      'Non comprare casa per scappare dall’affitto: compra casa quando aumenta libertà.',
      'Prima aumenta anticipo, investimenti e runway.',
      'Valuta casa come infrastruttura di vita, non solo investimento.'
    ],
    emotional_purchase: [
      'Trasforma il desiderio in obiettivo misurabile.',
      'Aspetta 90 giorni e verifica se lo vuoi ancora.',
      'Compra solo se non riduce fondo emergenza e piano investimenti.'
    ],
    reputation: [
      'Pubblica una versione imperfetta ma vera.',
      'Mostra come pensi, non solo cosa hai fatto.',
      'Scegli un pubblico di professionisti, non like generici.'
    ],
    creative_project: [
      'Non industrializzare ciò che deve restare sacro.',
      'Fai una micro-versione di qualità.',
      'Trasforma il progetto in asset reputazionale.'
    ],
    finance: [
      'Prima fondo emergenza, poi ETF automatico.',
      'Evita trading e mosse speculative.',
      'Misura mesi di libertà, non solo rendimento.'
    ],
    career: [
      'LEGO è acceleratore, non gabbia.',
      'Scegli mosse che aumentano reputazione e ownership.',
      'Non lasciare stabilità senza seconda fonte forte.'
    ],
    life_decision: [
      'Chiedi: questa scelta aumenta libertà, verità o amore?',
      'Trova la versione più piccola e reversibile.',
      'Aspetta se la scelta nasce da ansia.'
    ]
  };

  return {
    ...common,
    counsellors: {
      CFO: `Valuto impatto su libertà finanziaria, liquidità e rischio. Se non aumenta patrimonio o opzionalità, serve cautela.`,
      Strategist: `La domanda è: rafforza il sistema Giuseppe o apre un nuovo fronte?`,
      CreativeDirector: `Protegge il linguaggio personale. Se è creativo, deve aumentare significato, non rumore.`,
      Psychologist: `Controllo se la scelta nasce da paura, ego, status o desiderio autentico.`,
      Mentor: `La scelta deve rimanere connessa al proposito spirituale e alla persona che vuoi diventare.`,
      CEO2036: `Verdetto provvisorio: procedi solo nella versione che aumenta libertà e capitale a lungo termine.`
    },
    alternatives: alternatives[category],
    nextStep: alternatives[category][0]
  };
}
