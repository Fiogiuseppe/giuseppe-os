'use client';

import { useMemo, useState } from 'react';
import brain from '../memory/giuseppe_brain.json';
import { financeDisplay } from './financeDisplay';
import {
  runDecisionEngine,
  getCapitalLabel,
  COUNSELLOR_LABELS,
  type DecisionResult
} from '../engine/decisionEngine';
import { runPotentialEngine } from '../engine/potentialEngine';
import { runAwarenessEngine } from '../engine/awarenessEngine';

type View = 'home' | 'board' | 'today' | 'projects' | 'finance' | 'awareness' | 'brain';

const NAV: { id: View; label: string }[] = [
  { id: 'home', label: 'Home' },
  { id: 'board', label: 'Board' },
  { id: 'today', label: 'Today' },
  { id: 'projects', label: 'Projects' },
  { id: 'finance', label: 'Finance' },
  { id: 'awareness', label: 'Awareness' },
  { id: 'brain', label: 'Brain' }
];

const VIEW_HEADINGS: Record<View, string> = {
  home: 'GIUSEPPE OS',
  board: 'PROGETTARE UNA VITA CHE MI RENDA LIBERO DI CREARE CIÒ CHE CONTA.',
  today: 'UN PASSO ALLA VOLTA VERSO LA LIBERTÀ.',
  projects: 'IL SISTEMA GIUSEPPE.',
  finance: 'COMPRA LIBERTÀ, NON STATUS.',
  awareness: 'I NOTICED SOMETHING.',
  brain: 'CHI HO SCELTO DI DIVENTARE.'
};

const PROJECT_PROGRESS: Record<string, number> = {
  LEGO: 87,
  'Brand Giuseppe': 74,
  'Medium/LinkedIn': 68,
  'Visceral Poems': 75,
  UREES: 82,
  Freelance: 45
};

function StrategicCard({
  icon,
  title,
  description,
  linkLabel,
  onNavigate,
  badge
}: {
  icon: string;
  title: string;
  description: string;
  linkLabel: string;
  onNavigate: () => void;
  badge?: string;
}) {
  return (
    <div className="card strategic-card">
      <div className="strategic-top">
        <div className="strategic-icon">{icon}</div>
        {badge && <span className="badge-new">{badge}</span>}
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
      <button type="button" className="card-link" onClick={onNavigate}>{linkLabel}</button>
    </div>
  );
}

function FinancePrivacyCard({ onViewAll }: { onViewAll: () => void }) {
  return (
    <div className="card">
      <div className="card-head">
        <h3>Financial Overview</h3>
        <button type="button" className="card-link" onClick={onViewAll}>View all →</button>
      </div>
      <div className="finance-privacy">
        <div className="finance-list">
          <div className="finance-row"><span>Cash Reserve</span><span>{financeDisplay.cashReserve}</span></div>
          <div className="finance-row"><span>Investments</span><span>•••••</span></div>
          <div className="finance-row"><span>Savings</span><span>•••••</span></div>
          <div className="finance-row"><span>Monthly Income</span><span>{financeDisplay.income}</span></div>
          <div className="finance-row"><span>Monthly Expenses</span><span>•••••</span></div>
        </div>
        <div className="finance-lock">
          <div className="finance-lock-icon">🔒</div>
          <p>Information hidden for privacy</p>
        </div>
      </div>
      <p className="card-muted">Last updated: today</p>
    </div>
  );
}

function ActiveProjectsCard({ onViewAll }: { onViewAll: () => void }) {
  const rows = Object.entries(brain.projects)
    .filter(([, project]) => project.status === 'active' || project.status === 'slow-active')
    .slice(0, 3);

  return (
    <div className="card span-6">
      <div className="card-head">
        <h3>Active Projects</h3>
        <button type="button" className="card-link" onClick={onViewAll}>View all →</button>
      </div>
      {rows.map(([name, project]) => (
        <div className="project-row" key={name}>
          <div className="project-avatar">{name.slice(0, 2).toUpperCase()}</div>
          <div className="project-meta">
            <h4>{name}</h4>
            <p>{project.role}</p>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${PROJECT_PROGRESS[name] ?? 60}%` }} />
            </div>
          </div>
          <div className="project-status">
            <span className="status-active-dot" />
            Active
          </div>
          <div className="project-progress">{PROJECT_PROGRESS[name] ?? 60}%</div>
        </div>
      ))}
      <p className="card-muted">{rows.length} active projects</p>
    </div>
  );
}

function FinanceOverview() {
  return (
    <div className="grid">
      <div className="card card-glow privacy-overlay">
        <div className="kicker">CASH RESERVE</div>
        <h2 className="privacy-blur">{financeDisplay.cashReserve}</h2>
        <p>{financeDisplay.cashCaption}</p>
      </div>
      <div className="card privacy-overlay">
        <div className="kicker">INCOME</div>
        <h2 className="privacy-blur">{financeDisplay.income}</h2>
        <p>{financeDisplay.incomeCaption}</p>
      </div>
      <div className="card">
        <div className="kicker">GOALS</div>
        <h2>Obiettivi finanziari.</h2>
        <ul>{financeDisplay.goals.map(goal => <li key={goal}>{goal}</li>)}</ul>
      </div>
    </div>
  );
}

function DecisionEnginePanel() {
  const [decision, setDecision] = useState('');
  const [reason, setReason] = useState('');
  const [result, setResult] = useState<DecisionResult | null>(null);

  return (
    <div className="card card-glow">
      <div className="kicker">DECISION ENGINE</div>
      <h2>Chiedi al Board.</h2>
      <p>Scrivi una decisione. Il sistema cambia ragionamento in base al contesto.</p>
      <label>Decisione</label>
      <input
        className="input"
        value={decision}
        onChange={e => setDecision(e.target.value)}
        placeholder="Es. comprare casa, pubblicare un post, investire..."
      />
      <label>Perché la vuoi fare?</label>
      <textarea
        className="textarea"
        value={reason}
        onChange={e => setReason(e.target.value)}
        placeholder="Motivo vero."
      />
      <button className="primary" onClick={() => setResult(runDecisionEngine({ decision, reason }))}>
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
  );
}

function PotentialPanel() {
  const potential = useMemo(() => runPotentialEngine(), []);
  const today = potential.todaysOpportunity;

  return (
    <>
      <section className="hero">
        <div className="potential-card potential-span2 card-glow">
          <div className="kicker">TODAY&apos;S OPPORTUNITY</div>
          <div className="potential-h1">{today.title}</div>
          <p>{today.description}</p>
          <p><b>Perché conta:</b> {today.whyThisMatters}</p>
          <p><b>Prima azione:</b> {today.firstAction}</p>
          <div className="potential-meta">
            Impatto {today.estimatedImpact} · {today.timeRequired} · energia {today.energyRequired}
          </div>
        </div>
        <div className="potential-card">
          <div className="kicker">CONFIDENCE</div>
          <div className="potential-score">{today.confidenceScore}</div>
          <p>Score {Math.round(today.totalScore)} · {today.sourceProject ?? 'sistema'}</p>
        </div>
      </section>
      <section className="potential-grid">
        {[
          ['CREATIVE CHALLENGE', potential.creativeChallenge],
          ['SKILL TO LEARN', potential.skillToLearn],
          ['PERSON TO CONTACT', potential.personToContact],
          ['ARTICLE TO READ', potential.articleToRead],
          ['PROJECT TO FINISH', potential.projectToFinish],
          ['RISK TO AVOID', potential.riskToAvoid],
          ['QUESTION OF THE DAY', potential.questionOfTheDay],
          ['WEEKLY FOCUS', potential.weeklyFocus]
        ].map(([label, value]) => (
          <div className="potential-card" key={label}>
            <div className="kicker">{label}</div>
            <p>{value}</p>
          </div>
        ))}
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
  );
}

export default function Home() {
  const [view, setView] = useState<View>('home');
  const potential = useMemo(() => runPotentialEngine(), []);
  const awareness = useMemo(() => runAwarenessEngine(), []);
  const today = potential.todaysOpportunity;

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-star">✦</div>
          <div className="sidebar-logo">Giuseppe OS</div>
        </div>
        <nav className="sidebar-nav" aria-label="Main navigation">
          {NAV.map(({ id, label }) => (
            <button
              key={id}
              className={view === id ? 'active' : undefined}
              onClick={() => setView(id)}
            >
              <span>{label}</span>
              {id === 'awareness' && <span className="nav-badge" aria-hidden="true">1</span>}
            </button>
          ))}
        </nav>
        <div className="sidebar-manifesto">
          <p>It&apos;s not software that tells you what to do.</p>
          <p>It&apos;s software that remembers who you chose to become.</p>
        </div>
      </aside>

      <div className="content">
        <main className="main" role="main">
          {view === 'home' && (
            <>
              <div className="home-header-row">
                <div>
                  <h1 className="home-greeting">Good morning, Giuseppe.</h1>
                  <p className="view-subtitle">Here is your operating system for becoming who you chose to become.</p>
                  <div className="view-title">GIUSEPPE OS</div>
                </div>
                <div className="status-pill"><span className="status-dot" /> System Online</div>
              </div>

              <div className="dashboard-grid">
                <div className="span-3">
                  <StrategicCard
                    icon="★"
                    title="North Star"
                    description="Create impact and freedom. Build a legacy that matters."
                    linkLabel="View North Star →"
                    onNavigate={() => setView('board')}
                  />
                </div>
                <div className="span-3">
                  <StrategicCard
                    icon="◎"
                    title="Mission 2036"
                    description={brain.mission_2036}
                    linkLabel="View Mission →"
                    onNavigate={() => setView('board')}
                  />
                </div>
                <div className="span-3">
                  <StrategicCard
                    icon="☰"
                    title="Today's Focus"
                    description={today.title}
                    linkLabel="View Priorities →"
                    onNavigate={() => setView('today')}
                  />
                </div>
                <div className="span-3">
                  <StrategicCard
                    icon="◉"
                    title="Awareness"
                    description="I noticed something you should see."
                    linkLabel="Open Awareness →"
                    onNavigate={() => setView('awareness')}
                    badge="New"
                  />
                </div>

                <ActiveProjectsCard onViewAll={() => setView('projects')} />

                <div className="span-3 stack-col">
                  <FinancePrivacyCard onViewAll={() => setView('finance')} />
                </div>

                <div className="span-3 stack-col">
                  <div className="card">
                    <div className="kicker">DAILY RITUAL</div>
                    <div className="ritual-ring"><span>75%</span></div>
                    <p>You completed 3 of 4 essential rituals today.</p>
                    <button type="button" className="card-link" onClick={() => setView('today')}>Open Daily Ritual →</button>
                  </div>
                  <div className="card card-glow">
                    <div className="kicker">DECISION ENGINE</div>
                    <h3>Ask your 6 advisors.</h3>
                    <p>Get clarity on any decision.</p>
                    <button type="button" className="primary primary-wide" onClick={() => setView('today')}>
                      Ask a Question →
                    </button>
                  </div>
                </div>

                <div className="card insight-banner span-12">
                  <div className="insight-icon">💡</div>
                  <p>{awareness.insight}</p>
                </div>
              </div>
            </>
          )}

          {view !== 'home' && (
            <header className="page-header">
              <div className="kicker">{view.toUpperCase()}</div>
              <div className="view-title">{VIEW_HEADINGS[view]}</div>
            </header>
          )}

          {view === 'board' && (
            <>
              <section className="hero">
                <div className="card card-glow">
                  <div className="kicker">NORTH STAR</div>
                  <h2>{brain.north_star}</h2>
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
              <PotentialPanel />
            </>
          )}

          {view === 'today' && (
            <>
              <section className="hero">
                <div className="card card-glow">
                  <div className="kicker">TODAY</div>
                  <h2>{potential.weeklyFocus}</h2>
                  <p>Reputazione prima di perfezione.</p>
                </div>
                <div className="card">
                  <div className="kicker">NEXT MOVE</div>
                  <h2>Pubblica un pensiero vero.</h2>
                  <p>{today.firstAction}</p>
                </div>
              </section>
              <section className="decision">
                <div>
                  <div className="kicker">ASK THE BOARD</div>
                  <h2>Scrivi una decisione. Il sistema cambia ragionamento in base al contesto.</h2>
                </div>
                <DecisionEnginePanel />
              </section>
            </>
          )}

          {view === 'projects' && (
            <>
              <section className="card card-glow">
                <div className="kicker">STRATEGIST</div>
                <h2>Non più idee: più concentrazione.</h2>
                <p>Ogni progetto deve rafforzare l&apos;ecosistema.</p>
              </section>
              <section className="projects-grid">
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
              <section className="card card-glow">
                <div className="kicker">CFO</div>
                <h2>Automatizza investimenti.</h2>
                <p>Misura mesi di libertà, non solo rendimento.</p>
              </section>
              <FinanceOverview />
            </>
          )}

          {view === 'awareness' && (
            <>
              <section className="hero">
                <div className="card card-glow">
                  <div className="kicker">AWARENESS</div>
                  <p>Pattern intelligence from memory.</p>
                </div>
                <div className="card">
                  <div className="kicker">INSIGHT</div>
                  <h2>{awareness.insight}</h2>
                  <p>{awareness.whyItMatters}</p>
                </div>
              </section>
              <section className="decision">
                <div className="card">
                  <div className="kicker">EVIDENCE FROM MEMORY</div>
                  <ul>{awareness.evidence.map(item => <li key={item}>{item}</li>)}</ul>
                  <div className="kicker">RISK IF IGNORED</div>
                  <p>{awareness.riskIfIgnored}</p>
                </div>
                <div className="card">
                  <div className="kicker">REFLECT</div>
                  <p>{awareness.reflectionQuestion}</p>
                  <div className="kicker">RECOMMENDED ACTION</div>
                  <p>{awareness.recommendedAction}</p>
                  <div className="kicker">CONFIDENCE</div>
                  <div className="potential-score">{awareness.confidenceScore}</div>
                </div>
              </section>
            </>
          )}

          {view === 'brain' && (
            <>
              <section className="hero">
                <div className="card card-glow">
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

        <footer className="footer">
          <p>It&apos;s not software that tells you what to do.</p>
          <p>It&apos;s software that remembers who you chose to become.</p>
        </footer>
      </div>
    </div>
  );
}
