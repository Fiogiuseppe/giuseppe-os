'use client';

import { useState } from 'react';
import brain from '../memory/giuseppe_brain.json';
import {
  runDecisionEngine,
  getCapitalLabel,
  COUNSELLOR_LABELS,
  type DecisionResult
} from '../engine/decisionEngine';

type View = 'board' | 'today' | 'projects' | 'finance' | 'brain';

const NAV: { id: View; label: string }[] = [
  { id: 'board', label: 'Board' },
  { id: 'today', label: 'Today' },
  { id: 'projects', label: 'Projects' },
  { id: 'finance', label: 'Finance' },
  { id: 'brain', label: 'Brain' }
];

export default function Home() {
  const [view, setView] = useState<View>('board');
  const [decision, setDecision] = useState('');
  const [reason, setReason] = useState('');
  const [result, setResult] = useState<DecisionResult | null>(null);

  return (
    <div className="shell">
      <header className="top">
        <div className="logo">GIUSEPPE OS</div>
        <nav className="nav">
          {NAV.map(({ id, label }) => (
            <button
              key={id}
              className={view === id ? 'active' : undefined}
              onClick={() => setView(id)}
            >
              {label}
            </button>
          ))}
        </nav>
      </header>

      <main className="main">
        {view === 'board' && (
          <>
            <section className="hero">
              <div>
                <div className="kicker">NORTH STAR</div>
                <div className="h1">{brain.north_star}</div>
              </div>
              <div className="card">
                <div className="kicker">PURPOSE ENGINE</div>
                <h2>{brain.manifesto}</h2>
                <p>Missione 2036: {brain.mission_2036.toLowerCase()}</p>
              </div>
            </section>

            <section className="grid">
              <div className="card"><div className="kicker">NEXT MOVE</div><h2>Pubblica un pensiero vero.</h2><p>Reputazione prima di perfezione.</p></div>
              <div className="card"><div className="kicker">CFO</div><h2>Automatizza investimenti.</h2><p>Compra libertà, non status.</p></div>
              <div className="card"><div className="kicker">STRATEGIST</div><h2>Congela una nuova idea.</h2><p>Il rischio è dispersione.</p></div>
            </section>
          </>
        )}

        {view === 'today' && (
          <>
            <section className="hero">
              <div>
                <div className="kicker">TODAY</div>
                <div className="h1">UN PASSO ALLA VOLTA VERSO LA LIBERTÀ.</div>
              </div>
              <div className="card">
                <div className="kicker">NEXT MOVE</div>
                <h2>Pubblica un pensiero vero.</h2>
                <p>Reputazione prima di perfezione.</p>
              </div>
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
                <button
                  className="primary"
                  onClick={() => setResult(runDecisionEngine({ decision, reason }))}
                >
                  Chiedi al Board
                </button>
                {result && (
                  <div className="result">
                    <h3>Categoria: {result.categoryLabel}</h3>
                    <p><b>Bisogno nascosto:</b> {result.hiddenNeed}</p>
                    <p><b>Bias possibile:</b> {result.bias}</p>
                    <h3>Sei capitali</h3>
                    {Object.entries(result.capitals).map(([key, value]) => (
                      <p key={key}>
                        <b>{getCapitalLabel(key as keyof typeof result.capitals)} ({value.score}):</b> {value.note}
                      </p>
                    ))}
                    <h3>Board</h3>
                    {Object.entries(result.counsellors).map(([key, text]) => (
                      <p key={key}><b>{COUNSELLOR_LABELS[key as keyof typeof result.counsellors]}:</b> {text}</p>
                    ))}
                    <h3>Versione migliore</h3>
                    <p>{result.betterVersion}</p>
                    <h3>Prossimo passo</h3>
                    <p>{result.nextAction}</p>
                  </div>
                )}
              </div>
            </section>
          </>
        )}

        {view === 'projects' && (
          <>
            <section className="hero">
              <div>
                <div className="kicker">PROJECTS</div>
                <div className="h1">IL SISTEMA GIUSEPPE.</div>
              </div>
              <div className="card">
                <div className="kicker">STRATEGIST</div>
                <h2>Non più idee: più concentrazione.</h2>
                <p>Ogni progetto deve rafforzare l'ecosistema.</p>
              </div>
            </section>

            <section className="grid">
              {Object.entries(brain.projects).map(([name, project]) => (
                <div className="card" key={name}>
                  <div className="kicker">{project.status.toUpperCase()}</div>
                  <h2>{name}</h2>
                  <p>{project.role}</p>
                </div>
              ))}
            </section>
          </>
        )}

        {view === 'finance' && (
          <>
            <section className="hero">
              <div>
                <div className="kicker">FINANCE</div>
                <div className="h1">COMPRA LIBERTÀ, NON STATUS.</div>
              </div>
              <div className="card">
                <div className="kicker">CFO</div>
                <h2>Automatizza investimenti.</h2>
                <p>Misura mesi di libertà, non solo rendimento.</p>
              </div>
            </section>

            <section className="grid">
              <div className="card">
                <div className="kicker">CASH</div>
                <h2>{brain.finance.cash_dkk.toLocaleString('it-IT')} DKK</h2>
                <p>Liquidità disponibile.</p>
              </div>
              <div className="card">
                <div className="kicker">INCOME</div>
                <h2>Entrate attive.</h2>
                <p>{brain.finance.monthly_income_notes}</p>
              </div>
              <div className="card">
                <div className="kicker">GOALS</div>
                <h2>Obiettivi finanziari.</h2>
                <ul>{brain.finance.main_goals.map(goal => <li key={goal}>{goal}</li>)}</ul>
              </div>
            </section>
          </>
        )}

        {view === 'brain' && (
          <>
            <section className="hero">
              <div>
                <div className="kicker">BRAIN</div>
                <div className="h1">CHI HO SCELTO DI DIVENTARE.</div>
              </div>
              <div className="card">
                <div className="kicker">MEMORY</div>
                <h2>{brain.manifesto}</h2>
                <p>Missione 2036: {brain.mission_2036.toLowerCase()}</p>
              </div>
            </section>

            <section className="grid">
              <div className="card">
                <div className="kicker">VALUES</div>
                <h2>Valori.</h2>
                <ul>{brain.values.map(value => <li key={value}>{value}</li>)}</ul>
              </div>
              <div className="card">
                <div className="kicker">RULES</div>
                <h2>Regole.</h2>
                <ul>{brain.rules.map(rule => <li key={rule}>{rule}</li>)}</ul>
              </div>
              <div className="card">
                <div className="kicker">PATTERNS</div>
                <h2>Pattern.</h2>
                <ul>{brain.patterns.map(pattern => <li key={pattern}>{pattern}</li>)}</ul>
              </div>
            </section>
          </>
        )}
      </main>

      <footer className="footer">v0.1 foundation · next step: real AI + persistent memory</footer>
    </div>
  );
}
