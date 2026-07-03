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
import {
  AccordionDomain,
  DisclosurePanel,
  DisclosureTrigger,
  RitualStep
} from './components/Disclosure';
import { JewelFace } from './components/JewelFace';

type View = 'today' | 'decisions' | 'discover' | 'create' | 'memory';

const NAV: { id: View; label: string; role: string }[] = [
  { id: 'today', label: 'Today', role: 'Daily companion' },
  { id: 'decisions', label: 'Decisions', role: 'Decision room' },
  { id: 'discover', label: 'Discover', role: 'Quiet discovery' },
  { id: 'create', label: 'Create', role: 'Energy allocation' },
  { id: 'memory', label: 'Memory', role: 'Memory palace' }
];

const VIEW_HEADINGS: Record<View, string> = {
  today: 'IL MIGLIOR PASSO DI OGGI.',
  decisions: 'PROGETTARE UNA VITA CHE MI RENDA LIBERO DI CREARE CIÒ CHE CONTA.',
  discover: 'I NOTICED SOMETHING.',
  create: 'IL SISTEMA GIUSEPPE.',
  memory: 'CHI HO SCELTO DI DIVENTARE.'
};

const PROJECT_PROGRESS: Record<string, number> = {
  LEGO: 87,
  'Brand Giuseppe': 74,
  'Medium/LinkedIn': 68,
  'Visceral Poems': 75,
  UREES: 82,
  Freelance: 45
};

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
    <div className="result progressive-result space-today-result">
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
      {!boardOpen && !whyOpen && (
        <DisclosureTrigger label="Mostra il Board" onClick={() => { setWhyOpen(true); setBoardOpen(true); }} />
      )}
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
      {!open && <DisclosureTrigger label="Explore opportunities" onClick={() => setOpen(true)} />}
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
        <section className="projects-grid card-scroll project-map">
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
  const [view, setView] = useState<View>('today');
  const potential = useMemo(() => runPotentialEngine(), []);
  const awareness = useMemo(() => runAwarenessEngine(), []);
  const todayOpp = potential.todaysOpportunity;
  const [projectName] = recommendedProject();

  const [decision, setDecision] = useState('');
  const [reason, setReason] = useState('');
  const [decisionResult, setDecisionResult] = useState<DecisionResult | null>(null);

  const [todayCreative, setTodayCreative] = useState(false);
  const [todayReflect, setTodayReflect] = useState(false);
  const [todayOpportunity, setTodayOpportunity] = useState(false);

  const [awarenessWhy, setAwarenessWhy] = useState(false);
  const [awarenessEvidence, setAwarenessEvidence] = useState(false);
  const [awarenessReflect, setAwarenessReflect] = useState(false);
  const [awarenessAction, setAwarenessAction] = useState(false);

  const [boardWhy, setBoardWhy] = useState(false);
  const [boardDiscussion, setBoardDiscussion] = useState(false);
  const [boardAdvisors, setBoardAdvisors] = useState(false);
  const [boardEvidence, setBoardEvidence] = useState(false);
  const [boardConfidence, setBoardConfidence] = useState(false);
  const [boardPurpose, setBoardPurpose] = useState(false);

  const [projectsWhy, setProjectsWhy] = useState(false);
  const [financeGoals, setFinanceGoals] = useState(false);
  const [discoverFinance, setDiscoverFinance] = useState(false);

  const activeNav = NAV.find(item => item.id === view);

  return (
    <div className="app app-topnav">
      <header className="topbar">
        <button type="button" className="topbar-brand" onClick={() => setView('today')} aria-label="Giuseppe OS home">
          <span className="brand-mark" aria-hidden="true">G</span>
          <span className="brand-wordmark">Giuseppe</span>
          <span className="brand-sub">OS</span>
        </button>
        <nav className="topnav" aria-label="Main navigation">
          {NAV.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              className={view === id ? 'active' : undefined}
              onClick={() => setView(id)}
            >
              {label}
            </button>
          ))}
        </nav>
        <div className="topbar-status">
          <span className="status-dot" />
          <span className="topbar-status-label">Online</span>
        </div>
      </header>

      <div className="app-body">
        <main className={`main space-${view} ${view === 'today' ? 'main-home' : 'main-progressive'}`} role="main">
          <header className={`page-header progressive-header space-header-${view}`}>
            <div className="space-meta">
              <div className="kicker">{view}</div>
              {activeNav && <span className="space-role">{activeNav.role}</span>}
            </div>
            <div className="view-title">{VIEW_HEADINGS[view]}</div>
            {view === 'today' && (
              <p className="companion-greeting">Good morning, Giuseppe.</p>
            )}
          </header>

          <div className={`view-body progressive-body mental-space mental-space-${view}`}>
            {view === 'today' && (
              <div className="daily-companion">
                <aside className="companion-presence">
                  <JewelFace />
                </aside>
                <div className="companion-content">
                <section className="companion-block card card-glow">
                  <div className="kicker">TODAY&apos;S FOCUS</div>
                  <h2 className="focus-line">{todayOpp.title}</h2>
                </section>

                <section className="companion-block card">
                  <div className="kicker">WHY IT MATTERS</div>
                  <p className="insight-line">{todayOpp.whyThisMatters}</p>
                </section>

                <section className="companion-block card present-action">
                  <div className="kicker">RECOMMENDED ACTION</div>
                  <p className="action-line">{todayOpp.firstAction}</p>
                  <button type="button" className="primary-action" onClick={() => setView('decisions')}>
                    Take this step
                  </button>
                </section>

                {!todayCreative && (
                  <DisclosureTrigger label="Creative suggestion" onClick={() => setTodayCreative(true)} />
                )}
                <DisclosurePanel open={todayCreative}>
                  <section className="card companion-block">
                    <div className="kicker">CREATIVE SUGGESTION</div>
                    <p>{potential.creativeChallenge}</p>
                  </section>
                </DisclosurePanel>

                {!todayReflect && (
                  <DisclosureTrigger label="Reflection" onClick={() => setTodayReflect(true)} />
                )}
                <DisclosurePanel open={todayReflect}>
                  <section className="card companion-block">
                    <div className="kicker">REFLECTION</div>
                    <p>{awareness.reflectionQuestion}</p>
                  </section>
                </DisclosurePanel>

                {!todayOpportunity && (
                  <DisclosureTrigger label="Opportunity" onClick={() => setTodayOpportunity(true)} />
                )}
                <DisclosurePanel open={todayOpportunity}>
                  <section className="card companion-block">
                    <div className="kicker">OPPORTUNITY</div>
                    <h2>{todayOpp.title}</h2>
                    <p>{todayOpp.description}</p>
                  </section>
                </DisclosurePanel>
                </div>
              </div>
            )}

            {view === 'decisions' && (
              <div className="decision-room">
                <section className="decision-room-core card card-glow">
                  <div className="kicker">RECOMMENDATION</div>
                  <h2 className="decision-room-question">Pubblica un pensiero vero.</h2>
                  <p>Reputazione prima di perfezione.</p>
                </section>

                {!boardWhy && <DisclosureTrigger label="Perché?" onClick={() => setBoardWhy(true)} />}
                <DisclosurePanel open={boardWhy}>
                  <section className="card decision-room-why">
                    <p>La reputazione stimata richiede prove pubbliche. Il perfezionismo è paura travestita da standard.</p>
                  </section>
                </DisclosurePanel>

                {!boardDiscussion && boardWhy && (
                  <DisclosureTrigger label="Board discussion" onClick={() => setBoardDiscussion(true)} />
                )}
                {!boardDiscussion && !boardWhy && (
                  <DisclosureTrigger label="Board discussion" onClick={() => { setBoardWhy(true); setBoardDiscussion(true); }} />
                )}
                <DisclosurePanel open={boardDiscussion}>
                  <section className="card">
                    <div className="kicker">BOARD DISCUSSION</div>
                    <p>Il Board concorda: concentrati su un pensiero vero, non su dieci bozze perfette.</p>
                  </section>
                </DisclosurePanel>

                {!boardAdvisors && boardDiscussion && (
                  <DisclosureTrigger label="Advisors" onClick={() => setBoardAdvisors(true)} />
                )}
                <DisclosurePanel open={boardAdvisors}>
                  <section className="grid board-why-grid">
                    <div className="card"><div className="kicker">NEXT MOVE</div><h2>Pubblica un pensiero vero.</h2><p>Reputazione prima di perfezione.</p></div>
                    <div className="card"><div className="kicker">CFO</div><h2>Automatizza investimenti.</h2><p>Compra libertà, non status.</p></div>
                    <div className="card"><div className="kicker">STRATEGIST</div><h2>Congela una nuova idea.</h2><p>Il rischio è dispersione.</p></div>
                  </section>
                </DisclosurePanel>

                {!boardEvidence && boardAdvisors && (
                  <DisclosureTrigger label="Evidence" onClick={() => setBoardEvidence(true)} />
                )}
                <DisclosurePanel open={boardEvidence}>
                  <section className="card">
                    <div className="kicker">EVIDENCE FROM MEMORY</div>
                    <ul>{brain.patterns.slice(0, 3).map(item => <li key={item}>{item}</li>)}</ul>
                  </section>
                </DisclosurePanel>

                {!boardConfidence && (
                  <DisclosureTrigger label="Confidence" onClick={() => setBoardConfidence(true)} />
                )}
                <DisclosurePanel open={boardConfidence}>
                  <section className="card">
                    <div className="kicker">CONFIDENCE</div>
                    <div className="potential-score">{todayOpp.confidenceScore}</div>
                  </section>
                </DisclosurePanel>

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

                <div className="ritual-flow decisions-form-flow">
                  <RitualStep step={1} label="DECISION ENGINE" isLast>
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
                  </RitualStep>

                  {decisionResult && (
                    <DecisionResultDisclosure
                      key={`${decisionResult.categoryLabel}-${decisionResult.nextAction}`}
                      result={decisionResult}
                    />
                  )}
                </div>
              </div>
            )}

            {view === 'discover' && (
              <div className="discover-space">
                <div className="quiet-discovery">
                  <section className="discovery-insight card">
                    <div className="kicker">INSIGHT</div>
                    <h2>{awareness.insight}</h2>
                  </section>

                  <div className="discovery-trail">
                    {!awarenessWhy && <DisclosureTrigger label="Tell me more" onClick={() => setAwarenessWhy(true)} />}
                    <DisclosurePanel open={awarenessWhy}>
                      <div className="card discovery-panel">
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
                      <div className="card discovery-panel">
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
                      <div className="card discovery-panel">
                        <div className="kicker">REFLECT</div>
                        <p>{awareness.reflectionQuestion}</p>
                      </div>
                    </DisclosurePanel>

                    {!awarenessAction && (
                      <DisclosureTrigger label="Suggested action" onClick={() => setAwarenessAction(true)} />
                    )}
                    <DisclosurePanel open={awarenessAction}>
                      <div className="card discovery-panel">
                        <div className="kicker">RECOMMENDED ACTION</div>
                        <p>{awareness.recommendedAction}</p>
                        <div className="kicker">CONFIDENCE</div>
                        <div className="potential-score">{awareness.confidenceScore}</div>
                      </div>
                    </DisclosurePanel>
                  </div>
                </div>

                {!discoverFinance && (
                  <DisclosureTrigger label="Freedom & finance" onClick={() => setDiscoverFinance(true)} />
                )}
                <DisclosurePanel open={discoverFinance}>
                <div className="freedom-cockpit discover-finance">
                  <section className="cockpit-gauge card card-glow">
                    <div className="kicker">FREEDOM SCORE</div>
                    <div className="freedom-gauge-ring">
                      <div className="potential-score">72</div>
                    </div>
                    <p>Stai comprando libertà, non status.</p>
                  </section>

                  <section className="card cockpit-recommendation">
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
                </DisclosurePanel>
              </div>
            )}

            {view === 'create' && (
              <div className="energy-ecosystem">
                <section className="ecosystem-focus card card-glow">
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
                <PotentialPanelDisclosure />
              </div>
            )}

            {view === 'memory' && (
              <div className="memory-palace">
                <p className="memory-palace-intro">Open a layer of memory.</p>
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
        </main>

        <footer className="footer">
          <p>It&apos;s not software that tells you what to do. It&apos;s software that remembers who you chose to become.</p>
        </footer>
      </div>
    </div>
  );
}
