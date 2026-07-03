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
import { AccordionDomain, DisclosurePanel, DisclosureTrigger, StatusPill } from './components/Disclosure';

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

function activeProjectCount() {
  return Object.values(brain.projects).filter(p => p.status === 'active' || p.status === 'slow-active').length;
}

function recommendedProject() {
  const active = Object.entries(brain.projects).filter(([, p]) => p.status === 'active');
  return active[0] ?? Object.entries(brain.projects)[0];
}

function DecisionResultDisclosure({ result }: { result: DecisionResult }) {
  const [whyOpen, setWhyOpen] = useState(false);
  const [boardOpen, setBoardOpen] = useState(false);
  const [capitalsOpen, setCapitalsOpen] = useState(false);
  const [betterOpen, setBetterOpen] = useState(false);

  return (
    <div className="result progressive-result">
      <div className="kicker">RECOMMENDATION</div>
      <h3>Categoria: {result.categoryLabel}</h3>
      <div className="kicker">PROSSIMO PASSO</div>
      <p>{result.nextAction}</p>

      {!whyOpen && <DisclosureTrigger label="Perché?" onClick={() => setWhyOpen(true)} />}
      <DisclosurePanel open={whyOpen}>
        <div className="kicker">BISOGNO NASCOSTO</div>
        <p><b>Bisogno nascosto:</b> {result.hiddenNeed}</p>
        <p><b>Bias possibile:</b> {result.bias}</p>
      </DisclosurePanel>

      {!boardOpen && whyOpen && <DisclosureTrigger label="Mostra il Board" onClick={() => setBoardOpen(true)} />}
      {!boardOpen && !whyOpen && <DisclosureTrigger label="Mostra il Board" onClick={() => { setWhyOpen(true); setBoardOpen(true); }} />}
      <DisclosurePanel open={boardOpen}>
        <div className="kicker">BOARD</div>
        {Object.entries(result.counsellors).map(([key, text]) => (
          <p key={key}><b>{COUNSELLOR_LABELS[key as keyof typeof result.counsellors]}:</b> {text}</p>
        ))}
      </DisclosurePanel>

      {!capitalsOpen && boardOpen && <DisclosureTrigger label="Sei capitali" onClick={() => setCapitalsOpen(true)} />}
      <DisclosurePanel open={capitalsOpen}>
        <h3>Sei capitali</h3>
        {Object.entries(result.capitals).map(([key, value]) => (
          <p key={key}>
            <b>{getCapitalLabel(key as keyof typeof result.capitals)} ({value.score}):</b> {value.note}
          </p>
        ))}
      </DisclosurePanel>

      {!betterOpen && <DisclosureTrigger label="Versione migliore" onClick={() => setBetterOpen(true)} />}
      <DisclosurePanel open={betterOpen}>
        <h3>Versione migliore</h3>
        <p>{result.betterVersion}</p>
      </DisclosurePanel>
    </div>
  );
}

function PotentialPanelDisclosure() {
  const potential = useMemo(() => runPotentialEngine(), []);
  const today = potential.todaysOpportunity;
  const [open, setOpen] = useState(false);

  return (
    <div className="potential-panel">
      {!open && (
        <DisclosureTrigger label="Explore opportunities" onClick={() => setOpen(true)} />
      )}
      <DisclosurePanel open={open}>
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
        <section className="potential-grid potential-panel-scroll">
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
      </DisclosurePanel>
    </div>
  );
}

function FinanceDetailsDisclosure() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {!open && <DisclosureTrigger label="Financial details" onClick={() => setOpen(true)} />}
      <DisclosurePanel open={open}>
        <div className="grid finance-details-grid">
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
      </DisclosurePanel>
    </>
  );
}

function ProjectsListDisclosure() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <>
      {!open && <DisclosureTrigger label="Open projects" onClick={() => setOpen(true)} />}
      <DisclosurePanel open={open}>
        <section className="projects-grid card-scroll">
          {Object.entries(brain.projects).map(([name, project]) => (
            <button
              type="button"
              key={name}
              className={`card project-select-card ${selected === name ? 'selected' : ''}`}
              onClick={() => setSelected(name)}
            >
              <div className="kicker">{project.status.toUpperCase()}</div>
              <h2>{name}</h2>
              <p>{project.role}</p>
            </button>
          ))}
        </section>
        {selected && (
          <div className="card project-detail-card">
            <div className="kicker">PROJECT DETAILS</div>
            <h2>{selected}</h2>
            <p>{brain.projects[selected as keyof typeof brain.projects].role}</p>
            <p>Progress: {PROJECT_PROGRESS[selected] ?? 60}%</p>
          </div>
        )}
      </DisclosurePanel>
    </>
  );
}

export default function Home() {
  const [view, setView] = useState<View>('home');
  const potential = useMemo(() => runPotentialEngine(), []);
  const awareness = useMemo(() => runAwarenessEngine(), []);
  const today = potential.todaysOpportunity;
  const [projectName] = recommendedProject();

  const [decision, setDecision] = useState('');
  const [reason, setReason] = useState('');
  const [decisionResult, setDecisionResult] = useState<DecisionResult | null>(null);

  const [awarenessWhy, setAwarenessWhy] = useState(false);
  const [awarenessEvidence, setAwarenessEvidence] = useState(false);
  const [awarenessReflect, setAwarenessReflect] = useState(false);
  const [awarenessAction, setAwarenessAction] = useState(false);

  const [boardWhy, setBoardWhy] = useState(false);
  const [boardDiscussion, setBoardDiscussion] = useState(false);
  const [boardPurpose, setBoardPurpose] = useState(false);

  const [projectsWhy, setProjectsWhy] = useState(false);

  const [financeGoals, setFinanceGoals] = useState(false);

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="brand-index">Personal OS</span>
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
        <main className={`main ${view === 'home' ? 'main-home' : 'main-progressive'}`} role="main">
          {view === 'home' && (
            <div className="home-shell progressive-home">
              <header className="progressive-hero">
                <div>
                  <p className="home-greeting">Good morning, Giuseppe.</p>
                  <div className="view-title">GIUSEPPE OS</div>
                </div>
                <div className="status-pill"><span className="status-dot" /> System Online</div>
              </header>

              <section className="progressive-focus card card-glow">
                <div className="kicker">TODAY&apos;S FOCUS</div>
                <h2 className="focus-line">{today.title}</h2>
              </section>

              <section className="progressive-insight card">
                <div className="kicker">AWARENESS</div>
                <p className="insight-line">{awareness.insight}</p>
              </section>

              <section className="progressive-action card">
                <div className="kicker">RECOMMENDED ACTION</div>
                <p className="action-line">{today.firstAction}</p>
                <button type="button" className="card-link" onClick={() => setView('today')}>Take this step</button>
              </section>

              <div className="status-indicators-row">
                <StatusPill label="Projects" value={`${activeProjectCount()} active`} onClick={() => setView('projects')} />
                <StatusPill label="Finance" value="Freedom path" onClick={() => setView('finance')} />
                <StatusPill label="Brain" value="Memory" onClick={() => setView('brain')} />
                <StatusPill label="Mission" value="2036" onClick={() => setView('board')} />
              </div>
            </div>
          )}

          {view !== 'home' && (
            <header className="page-header progressive-header">
              <div className="kicker">{view}</div>
              <div className="view-title">{VIEW_HEADINGS[view]}</div>
            </header>
          )}

          {view !== 'home' && (
            <div className="view-body progressive-body">
              {view === 'today' && (
                <div className="progressive-stack">
                  <section className="card card-glow progressive-level">
                    <div className="kicker">TODAY</div>
                    <h2>{potential.weeklyFocus}</h2>
                  </section>

                  <section className="card progressive-level">
                    <div className="kicker">NEXT MOVE</div>
                    <h2>{today.firstAction}</h2>
                  </section>

                  <section className="card progressive-level decision-form-card">
                    <div className="kicker">DECISION ENGINE</div>
                    <h2>Chiedi al Board.</h2>
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
                    <button
                      className="primary"
                      onClick={() => setDecisionResult(runDecisionEngine({ decision, reason }))}
                    >
                      Chiedi al Board
                    </button>
                  </section>

                  {decisionResult && (
                    <DecisionResultDisclosure
                      key={`${decisionResult.categoryLabel}-${decisionResult.nextAction}`}
                      result={decisionResult}
                    />
                  )}
                </div>
              )}

              {view === 'board' && (
                <div className="progressive-stack">
                  <section className="card card-glow progressive-level">
                    <div className="kicker">RECOMMENDATION</div>
                    <h2>Pubblica un pensiero vero.</h2>
                    <p>Reputazione prima di perfezione.</p>
                  </section>

                  {!boardWhy && <DisclosureTrigger label="Perché?" onClick={() => setBoardWhy(true)} />}
                  <DisclosurePanel open={boardWhy}>
                    <section className="grid board-why-grid">
                      <div className="card"><div className="kicker">NEXT MOVE</div><h2>Pubblica un pensiero vero.</h2><p>Reputazione prima di perfezione.</p></div>
                      <div className="card"><div className="kicker">CFO</div><h2>Automatizza investimenti.</h2><p>Compra libertà, non status.</p></div>
                      <div className="card"><div className="kicker">STRATEGIST</div><h2>Congela una nuova idea.</h2><p>Il rischio è dispersione.</p></div>
                    </section>
                  </DisclosurePanel>

                  {!boardDiscussion && boardWhy && (
                    <DisclosureTrigger label="Board discussion" onClick={() => setBoardDiscussion(true)} />
                  )}
                  {!boardDiscussion && !boardWhy && (
                    <DisclosureTrigger label="Board discussion" onClick={() => { setBoardWhy(true); setBoardDiscussion(true); }} />
                  )}

                  {!boardPurpose && (
                    <DisclosureTrigger label="Explore purpose" onClick={() => setBoardPurpose(true)} />
                  )}
                  <DisclosurePanel open={boardPurpose}>
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
                  </DisclosurePanel>

                  <PotentialPanelDisclosure />
                </div>
              )}

              {view === 'projects' && (
                <div className="progressive-stack">
                  <section className="card card-glow progressive-level">
                    <div className="kicker">TODAY&apos;S PROJECT RECOMMENDATION</div>
                    <h2>{projectName}</h2>
                    <p>{brain.projects[projectName as keyof typeof brain.projects].role}</p>
                  </section>

                  {!projectsWhy && <DisclosureTrigger label="Perché?" onClick={() => setProjectsWhy(true)} />}
                  <DisclosurePanel open={projectsWhy}>
                    <section className="card">
                      <div className="kicker">STRATEGIST</div>
                      <h2>Non più idee: più concentrazione.</h2>
                      <p>Ogni progetto deve rafforzare l&apos;ecosistema.</p>
                    </section>
                  </DisclosurePanel>

                  <ProjectsListDisclosure />
                </div>
              )}

              {view === 'finance' && (
                <div className="progressive-stack">
                  <section className="card card-glow progressive-level finance-freedom-card">
                    <div className="kicker">FREEDOM SCORE</div>
                    <div className="potential-score">72</div>
                    <p>Stai comprando libertà, non status.</p>
                  </section>

                  <section className="card progressive-level">
                    <div className="kicker">RECOMMENDATION</div>
                    <h2>Automatizza investimenti.</h2>
                    <p>Misura mesi di libertà, non solo rendimento.</p>
                  </section>

                  {!financeGoals && <DisclosureTrigger label="Goals" onClick={() => setFinanceGoals(true)} />}
                  <DisclosurePanel open={financeGoals}>
                    <div className="card">
                      <div className="kicker">GOALS</div>
                      <ul>{financeDisplay.goals.map(goal => <li key={goal}>{goal}</li>)}</ul>
                    </div>
                  </DisclosurePanel>

                  <FinanceDetailsDisclosure />
                </div>
              )}

              {view === 'awareness' && (
                <div className="progressive-stack">
                  <section className="card card-glow progressive-level">
                    <div className="kicker">AWARENESS</div>
                    <p>Pattern intelligence from memory.</p>
                  </section>

                  <section className="card progressive-level">
                    <div className="kicker">INSIGHT</div>
                    <h2>{awareness.insight}</h2>
                  </section>

                  {!awarenessWhy && <DisclosureTrigger label="Tell me more" onClick={() => setAwarenessWhy(true)} />}
                  <DisclosurePanel open={awarenessWhy}>
                    <div className="card">
                      <p>{awareness.whyItMatters}</p>
                    </div>
                  </DisclosurePanel>

                  {!awarenessEvidence && awarenessWhy && (
                    <DisclosureTrigger label="Show evidence" onClick={() => setAwarenessEvidence(true)} />
                  )}
                  {!awarenessEvidence && !awarenessWhy && (
                    <DisclosureTrigger label="Show evidence" onClick={() => { setAwarenessWhy(true); setAwarenessEvidence(true); }} />
                  )}
                  <DisclosurePanel open={awarenessEvidence}>
                    <div className="card">
                      <div className="kicker">EVIDENCE FROM MEMORY</div>
                      <ul>{awareness.evidence.map(item => <li key={item}>{item}</li>)}</ul>
                      <div className="kicker">RISK IF IGNORED</div>
                      <p>{awareness.riskIfIgnored}</p>
                    </div>
                  </DisclosurePanel>

                  {!awarenessReflect && awarenessEvidence && (
                    <DisclosureTrigger label="Reflect" onClick={() => setAwarenessReflect(true)} />
                  )}
                  <DisclosurePanel open={awarenessReflect}>
                    <div className="card">
                      <div className="kicker">REFLECT</div>
                      <p>{awareness.reflectionQuestion}</p>
                    </div>
                  </DisclosurePanel>

                  {!awarenessAction && (
                    <DisclosureTrigger label="Suggested action" onClick={() => setAwarenessAction(true)} />
                  )}
                  <DisclosurePanel open={awarenessAction}>
                    <div className="card">
                      <div className="kicker">RECOMMENDED ACTION</div>
                      <p>{awareness.recommendedAction}</p>
                      <div className="kicker">CONFIDENCE</div>
                      <div className="potential-score">{awareness.confidenceScore}</div>
                    </div>
                  </DisclosurePanel>
                </div>
              )}

              {view === 'brain' && (
                <div className="brain-domains progressive-stack">
                  <AccordionDomain title="Identity" kicker="IDENTITY">
                    <p>{brain.manifesto}</p>
                  </AccordionDomain>
                  <AccordionDomain title="Mission" kicker="MISSION">
                    <p>{brain.mission_2036}</p>
                  </AccordionDomain>
                  <AccordionDomain title="North Star" kicker="NORTH STAR">
                    <p>{brain.north_star}</p>
                  </AccordionDomain>
                  <AccordionDomain title="Values" kicker="VALUES">
                    <ul>{brain.values.map(value => <li key={value}>{value}</li>)}</ul>
                  </AccordionDomain>
                  <AccordionDomain title="Rules" kicker="RULES">
                    <ul>{brain.rules.map(rule => <li key={rule}>{rule}</li>)}</ul>
                  </AccordionDomain>
                  <AccordionDomain title="Projects" kicker="PROJECTS">
                    <ul>
                      {Object.entries(brain.projects).map(([name, project]) => (
                        <li key={name}>{name}: {project.role}</li>
                      ))}
                    </ul>
                  </AccordionDomain>
                  <AccordionDomain title="Relationships" kicker="RELATIONSHIPS">
                    <ul>{brain.contacts.map(contact => <li key={contact}>{contact}</li>)}</ul>
                  </AccordionDomain>
                  <AccordionDomain title="Learning" kicker="LEARNING">
                    <ul>{brain.reading_queue.map(item => <li key={item}>{item}</li>)}</ul>
                  </AccordionDomain>
                  <AccordionDomain title="Patterns" kicker="PATTERNS">
                    <ul>{brain.patterns.map(pattern => <li key={pattern}>{pattern}</li>)}</ul>
                  </AccordionDomain>
                  <AccordionDomain title="Knowledge" kicker="KNOWLEDGE">
                    <ul>{brain.skills.map(skill => <li key={skill}>{skill}</li>)}</ul>
                    <p>Creative goals: {brain.creative_goals.join(' · ')}</p>
                    <p>Career goals: {brain.career_goals.join(' · ')}</p>
                  </AccordionDomain>
                </div>
              )}
            </div>
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
