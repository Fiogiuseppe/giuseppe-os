'use client';

import { useMemo, useState } from 'react';
import brain from '../memory/giuseppe_brain.json';
import {
  runDecisionEngine,
  getCapitalLabel,
  COUNSELLOR_LABELS,
  type DecisionResult
} from '../engine/decisionEngine';
import { runPotentialEngine } from '../engine/potentialEngine';

type View = 'board' | 'today' | 'projects' | 'finance' | 'brain' | 'potential';

const NAV: { id: View; label: string }[] = [
  { id: 'board', label: 'Board' },
  { id: 'today', label: 'Today' },
  { id: 'potential', label: 'Potential' },
  { id: 'projects', label: 'Projects' },
  { id: 'finance', label: 'Finance' },
  { id: 'brain', label: 'Brain' }
];

export default function Home() {
  const [view, setView] = useState<View>('board');
  const [decision, setDecision] = useState('');
  const [reason, setReason] = useState('');
  const [result, setResult] = useState<DecisionResult | null>(null);
  const potential = useMemo(() => runPotentialEngine(), []);
  const today = potential.todaysOpportunity;

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

      <main className={view === 'potential' ? 'main potential-main' : 'main'}>
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

        {view === 'potential' && (
          <>
            <section className="potential-hero">
              <div className="potential-card potential-span2">
                <div className="kicker">TODAY&apos;S OPPORTUNITY</div>
                <div className="potential-h1">{today.title}</div>
                <p>{today.description}</p>
                <p><b>Perché conta:</b> {today.whyThisMatters}</p>
                <p><b>Prima azione:</b> {today.firstAction}</p>
                <div className="potential-meta">
                  Impatto {today.estimatedImpact} · {today.timeRequired} · energia {today.energyRequired} · allineamento {today.missionAlignment}
                </div>
              </div>
              <div className="potential-card">
                <div className="kicker">CONFIDENCE</div>
                <div className="potential-score">{today.confidenceScore}</div>
                <p>Score {Math.round(today.totalScore)} · {today.sourceProject ?? 'sistema'}</p>
              </div>
            </section>

            <section className="potential-grid">
              <div className="potential-card">
                <div className="kicker">CREATIVE CHALLENGE</div>
                <h2>Sfida.</h2>
                <p>{potential.creativeChallenge}</p>
              </div>
              <div className="potential-card">
                <div className="kicker">SKILL TO LEARN</div>
                <h2>Competenza.</h2>
                <p>{potential.skillToLearn}</p>
              </div>
              <div className="potential-card">
                <div className="kicker">PERSON TO CONTACT</div>
                <h2>Contatto.</h2>
                <p>{potential.personToContact}</p>
              </div>
              <div className="potential-card">
                <div className="kicker">ARTICLE TO READ</div>
                <h2>Lettura.</h2>
                <p>{potential.articleToRead}</p>
              </div>
              <div className="potential-card">
                <div className="kicker">PROJECT TO FINISH</div>
                <h2>Progetto.</h2>
                <p>{potential.projectToFinish}</p>
              </div>
              <div className="potential-card">
                <div className="kicker">RISK TO AVOID</div>
                <h2>Rischio.</h2>
                <p>{potential.riskToAvoid}</p>
              </div>
              <div className="potential-card">
                <div className="kicker">QUESTION OF THE DAY</div>
                <h2>Domanda.</h2>
                <p>{potential.questionOfTheDay}</p>
              </div>
              <div className="potential-card">
                <div className="kicker">WEEKLY FOCUS</div>
                <h2>Focus.</h2>
                <p>{potential.weeklyFocus}</p>
              </div>
              <div className="potential-card potential-span4">
                <div className="kicker">OPPORTUNITY HISTORY</div>
                <ul>
                  {potential.opportunityHistory.map(item => (
                    <li key={item.title}>
                      {item.title} — confidence {item.confidenceScore}, score {Math.round(item.totalScore)}
                    </li>
                  ))}
                </ul>
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
