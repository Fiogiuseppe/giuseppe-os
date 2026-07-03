'use client';

import { useState } from 'react';

type DecisionResult = {
  category: string;
  counsellors: Record<string, string>;
  alternatives: string[];
  nextStep: string;
};

function classifyDecision(text: string) {
  const t = text.toLowerCase();
  if (t.includes('casa') || t.includes('house')) return 'real_estate';
  if (t.includes('wrangler') || t.includes('macchina') || t.includes('car')) return 'emotional_purchase';
  if (t.includes('lego') || t.includes('lavoro') || t.includes('job')) return 'career';
  if (t.includes('post') || t.includes('linkedin') || t.includes('medium') || t.includes('instagram')) return 'reputation';
  if (t.includes('urees') || t.includes('visceral') || t.includes('arte')) return 'creative_project';
  if (t.includes('invest') || t.includes('etf') || t.includes('soldi')) return 'finance';
  return 'life_decision';
}

function runLocalBoard(decision: string, reason: string): DecisionResult {
  const category = classifyDecision(decision);
  const alternatives: Record<string, string[]> = {
    real_estate: [
      'Compra casa solo quando aumenta libertà, non quando scappi dall’affitto.',
      'Prima aumenta anticipo, runway e investimenti automatici.',
      'Valuta la casa come infrastruttura di vita, non solo investimento.'
    ],
    emotional_purchase: [
      'Aspetta 90 giorni e trasformalo in obiettivo misurabile.',
      'Non comprare se riduce fondo emergenza o piano ETF.',
      'Cerca una versione reversibile: noleggio, test, budget massimo.'
    ],
    reputation: [
      'Pubblica una versione imperfetta ma vera.',
      'Mostra come pensi, non solo cosa fai.',
      'Parla ai professionisti che vuoi rispettino il tuo lavoro.'
    ],
    creative_project: [
      'Fai una micro-versione di altissima qualità.',
      'Non industrializzare ciò che deve restare sacro.',
      'Trasforma il progetto in asset reputazionale.'
    ],
    finance: [
      'Prima fondo emergenza, poi ETF automatico.',
      'Evita trading e mosse speculative.',
      'Misura mesi di libertà, non solo rendimento.'
    ],
    career: [
      'LEGO è acceleratore, non gabbia.',
      'Scegli mosse che aumentano ownership e reputazione.',
      'Non lasciare stabilità senza seconda fonte forte.'
    ],
    life_decision: [
      'Chiedi se aumenta libertà, verità o amore.',
      'Trova la versione più piccola e reversibile.',
      'Aspetta se nasce da ansia.'
    ]
  };
  return {
    category,
    counsellors: {
      CFO: 'Valuto impatto su libertà finanziaria, liquidità e rischio.',
      Strategist: 'Rafforza il sistema Giuseppe o apre un nuovo fronte?',
      Creative: 'Aumenta significato e linguaggio personale o solo rumore?',
      Psychologist: `Il motivo dichiarato è: "${reason || 'non chiarito'}". Cerco paura, ego, status o desiderio autentico.`,
      Mentor: 'La scelta deve restare connessa al proposito spirituale.',
      CEO2036: 'Procedi solo nella versione che aumenta libertà e capitale a lungo termine.'
    },
    alternatives: alternatives[category],
    nextStep: alternatives[category][0]
  };
}

export default function Home() {
  const [decision, setDecision] = useState('');
  const [reason, setReason] = useState('');
  const [result, setResult] = useState<DecisionResult | null>(null);

  return (
    <div className="shell">
      <header className="top">
        <div className="logo">GIUSEPPE OS</div>
        <nav className="nav">
          <button>Board</button>
          <button>Decision</button>
          <button>Purpose</button>
          <button>Memory</button>
        </nav>
      </header>

      <main className="main">
        <section className="hero">
          <div>
            <div className="kicker">NORTH STAR</div>
            <div className="h1">PROGETTARE UNA VITA CHE MI RENDA LIBERO DI CREARE CIÒ CHE CONTA.</div>
          </div>
          <div className="card">
            <div className="kicker">PURPOSE ENGINE</div>
            <h2>Un sistema pensante che aiuta a vivere il proposito spirituale nella realtà pratica.</h2>
            <p>Missione 2036: costruire una persona che possa scegliere se lavorare oppure no.</p>
          </div>
        </section>

        <section className="grid">
          <div className="card"><div className="kicker">NEXT MOVE</div><h2>Pubblica un pensiero vero.</h2><p>Reputazione prima di perfezione.</p></div>
          <div className="card"><div className="kicker">CFO</div><h2>Automatizza investimenti.</h2><p>Compra libertà, non status.</p></div>
          <div className="card"><div className="kicker">STRATEGIST</div><h2>Congela una nuova idea.</h2><p>Il rischio è dispersione.</p></div>
        </section>

        <section className="decision">
          <div>
            <div className="kicker">ASK THE BOARD</div>
            <h1>Scrivi una decisione. Il sistema cambia ragionamento in base al contesto.</h1>
          </div>
          <div className="card">
            <label>Decisione</label>
            <input className="input" value={decision} onChange={e => setDecision(e.target.value)} placeholder="Es. comprare casa, pubblicare un post, investire..." />
            <label>Perché la vuoi fare?</label>
            <textarea className="textarea" value={reason} onChange={e => setReason(e.target.value)} placeholder="Motivo vero." />
            <button className="primary" onClick={() => setResult(runLocalBoard(decision, reason))}>Chiedi al Board</button>
            {result && (
              <div className="result">
                <h3>Categoria: {result.category}</h3>
                {Object.entries(result.counsellors).map(([name, text]) => <p key={name}><b>{name}:</b> {text}</p>)}
                <h3>Versione migliore</h3>
                <ul>{result.alternatives.map(a => <li key={a}>{a}</li>)}</ul>
                <h3>Prossimo passo</h3>
                <p>{result.nextStep}</p>
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="footer">v0.1 foundation · next step: real AI + persistent memory</footer>
    </div>
  );
}
