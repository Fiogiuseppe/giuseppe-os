'use client';

import { useEffect, useMemo, useState } from 'react';
import brain from '../memory/giuseppe_brain.json';
import { financeDisplay } from './financeDisplay';
import {
  getCapitalLabel,
  COUNSELLOR_LABELS
} from '../engine/decisionEngine';
import type { DecisionAIResult } from '../lib/brain/decisions/types';
import { decideViaBrain } from './lib/decideViaBrain';
import { fetchTodaysLetter } from './lib/fetchTodaysLetter';
import type { DailyBriefingResponse } from '../lib/briefing/types';
import { buildMemoryPalaceCards } from './lib/memoryPalaceCards';
import { runPotentialEngine } from '../engine/potentialEngine';
import { runAwarenessEngine } from '../engine/awarenessEngine';
import {
  DisclosurePanel,
  DisclosureTrigger,
  RitualStep
} from './components/Disclosure';
import { JewelFace } from './components/JewelFace';
import { useLanguage } from './lib/i18n/LanguageContext';

type View = 'today' | 'decisions' | 'discover' | 'create' | 'memory';

const VIEWS: View[] = ['today', 'decisions', 'discover', 'create', 'memory'];

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

function DecisionResultDisclosure({ result }: { result: DecisionAIResult }) {
  const { t } = useLanguage();
  const [whyOpen, setWhyOpen] = useState(false);
  const [boardOpen, setBoardOpen] = useState(false);
  const [capitalsOpen, setCapitalsOpen] = useState(false);
  const [betterOpen, setBetterOpen] = useState(false);

  return (
    <div className="result progressive-result space-today-result">
      <div className="kicker">{t('kickers.recommendation')}</div>
      <h3>{result.recommendation}</h3>
      <p>{t('decisionResult.category')}: {result.categoryLabel}</p>
      <div className="potential-score">{result.confidenceScore}</div>
      <div className="kicker">{t('decisionResult.nextStep')}</div>
      <p>{result.nextAction}</p>

      {!whyOpen && <DisclosureTrigger label={t('disclosure.why')} onClick={() => setWhyOpen(true)} />}
      <DisclosurePanel open={whyOpen}>
        <div className="kicker">{t('decisionResult.whyMatters')}</div>
        <p>{result.whyItMatters}</p>
        <div className="kicker">{t('decisionResult.hiddenNeed')}</div>
        <p><b>{t('decisionResult.hiddenNeedLabel')}:</b> {result.hiddenNeed}</p>
        <p><b>{t('decisionResult.biasLabel')}:</b> {result.bias}</p>
      </DisclosurePanel>

      {!boardOpen && whyOpen && <DisclosureTrigger label={t('disclosure.showBoard')} onClick={() => setBoardOpen(true)} />}
      {!boardOpen && !whyOpen && (
        <DisclosureTrigger label={t('disclosure.showBoard')} onClick={() => { setWhyOpen(true); setBoardOpen(true); }} />
      )}
      <DisclosurePanel open={boardOpen}>
        <div className="kicker">{t('kickers.board')}</div>
        {Object.entries(result.counsellors).map(([key, text]) => (
          <p key={key}><b>{COUNSELLOR_LABELS[key as keyof typeof result.counsellors]}:</b> {text}</p>
        ))}
      </DisclosurePanel>

      {!capitalsOpen && boardOpen && <DisclosureTrigger label={t('disclosure.capitals')} onClick={() => setCapitalsOpen(true)} />}
      <DisclosurePanel open={capitalsOpen}>
        <h3>{t('decisionResult.capitalsTitle')}</h3>
        {Object.entries(result.capitals).map(([key, value]) => (
          <p key={key}>
            <b>{getCapitalLabel(key as keyof typeof result.capitals)} ({value.score}):</b> {value.note}
          </p>
        ))}
      </DisclosurePanel>

      {!betterOpen && <DisclosureTrigger label={t('disclosure.betterVersion')} onClick={() => setBetterOpen(true)} />}
      <DisclosurePanel open={betterOpen}>
        <h3>{t('decisionResult.betterTitle')}</h3>
        <p>{result.betterVersion}</p>
      </DisclosurePanel>
    </div>
  );
}

function PotentialPanelDisclosure() {
  const { t } = useLanguage();
  const potential = useMemo(() => runPotentialEngine(), []);
  const today = potential.todaysOpportunity;
  const [open, setOpen] = useState(false);

  return (
    <div className="potential-panel">
      {!open && <DisclosureTrigger label={t('disclosure.exploreOpportunities')} onClick={() => setOpen(true)} />}
      <DisclosurePanel open={open}>
        <section className="hero">
          <div className="potential-card potential-span2 card-glow">
            <div className="kicker">{t('kickers.todaysOpportunity')}</div>
            <div className="potential-h1">{today.title}</div>
            <p>{today.description}</p>
            <p><b>{t('potential.whyMatters')}:</b> {today.whyThisMatters}</p>
            <p><b>{t('potential.firstAction')}:</b> {today.firstAction}</p>
            <div className="potential-meta">
              {t('potential.impact')} {today.estimatedImpact} · {today.timeRequired} · {t('potential.energy')} {today.energyRequired}
            </div>
          </div>
          <div className="potential-card">
            <div className="kicker">{t('kickers.confidence')}</div>
            <div className="potential-score">{today.confidenceScore}</div>
            <p>{t('potential.score')} {Math.round(today.totalScore)} · {today.sourceProject ?? t('potential.system')}</p>
          </div>
        </section>
        <section className="potential-grid potential-panel-scroll">
          {[
            [t('kickers.creativeChallenge'), potential.creativeChallenge],
            [t('kickers.skillToLearn'), potential.skillToLearn],
            [t('kickers.personToContact'), potential.personToContact],
            [t('kickers.articleToRead'), potential.articleToRead],
            [t('kickers.projectToFinish'), potential.projectToFinish],
            [t('kickers.riskToAvoid'), potential.riskToAvoid],
            [t('kickers.questionOfTheDay'), potential.questionOfTheDay],
            [t('kickers.weeklyFocus'), potential.weeklyFocus]
          ].map(([label, value]) => (
            <div className="potential-card" key={label}>
              <div className="kicker">{label}</div>
              <p>{value}</p>
            </div>
          ))}
          <div className="potential-card potential-span4">
            <div className="kicker">{t('kickers.opportunityHistory')}</div>
            <ul>
              {potential.opportunityHistory.map(item => (
                <li key={item.title}>
                  {item.title} — {t('potential.confidence')} {item.confidenceScore}, {t('potential.score').toLowerCase()} {Math.round(item.totalScore)}
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
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);

  return (
    <>
      {!open && <DisclosureTrigger label={t('disclosure.financialDetails')} onClick={() => setOpen(true)} />}
      <DisclosurePanel open={open}>
        <div className="grid finance-details-grid">
          <div className="card card-glow privacy-overlay">
            <div className="kicker">{t('kickers.cashReserve')}</div>
            <h2 className="privacy-blur">{financeDisplay.cashReserve}</h2>
            <p>{financeDisplay.cashCaption}</p>
          </div>
          <div className="card privacy-overlay">
            <div className="kicker">{t('kickers.income')}</div>
            <h2 className="privacy-blur">{financeDisplay.income}</h2>
            <p>{financeDisplay.incomeCaption}</p>
          </div>
          <div className="card">
            <div className="kicker">{t('kickers.goals')}</div>
            <h2>{t('finance.goalsTitle')}</h2>
            <ul>{financeDisplay.goals.map(goal => <li key={goal}>{goal}</li>)}</ul>
          </div>
        </div>
      </DisclosurePanel>
    </>
  );
}

function ProjectsListDisclosure() {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <>
      {!open && <DisclosureTrigger label={t('disclosure.openProjects')} onClick={() => setOpen(true)} />}
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
            <div className="kicker">{t('kickers.projectDetails')}</div>
            <h2>{selected}</h2>
            <p>{brain.projects[selected as keyof typeof brain.projects].role}</p>
            <p>{t('disclosure.progress')}: {PROJECT_PROGRESS[selected] ?? 60}%</p>
          </div>
        )}
      </DisclosurePanel>
    </>
  );
}

export default function Home() {
  const { t } = useLanguage();
  const [view, setView] = useState<View>('today');
  const potential = useMemo(() => runPotentialEngine(), []);
  const awareness = useMemo(() => runAwarenessEngine(), []);
  const todayOpp = potential.todaysOpportunity;
  const [projectName] = recommendedProject();

  const [decision, setDecision] = useState('');
  const [reason, setReason] = useState('');
  const [decisionResult, setDecisionResult] = useState<DecisionAIResult | null>(null);
  const [decisionLoading, setDecisionLoading] = useState(false);
  const [decisionError, setDecisionError] = useState<string | null>(null);

  async function handleAskBoard() {
    if (!decision.trim()) {
      return;
    }

    setDecisionLoading(true);
    setDecisionError(null);
    setDecisionResult(null);

    const response = await decideViaBrain(decision, reason);

    setDecisionLoading(false);

    if (!response.ok) {
      setDecisionError(response.message);
      return;
    }

    setDecisionResult(response.decision);
  }

  const [todayIgnore, setTodayIgnore] = useState(false);
  const [todayNourish, setTodayNourish] = useState(false);
  const [todayReflect, setTodayReflect] = useState(false);
  const [todayOpportunity, setTodayOpportunity] = useState(false);

  const [todaysLetter, setTodaysLetter] = useState<DailyBriefingResponse | null>(null);
  const [letterLoading, setLetterLoading] = useState(true);
  const [letterError, setLetterError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadLetter() {
      setLetterLoading(true);
      setLetterError(null);

      const response = await fetchTodaysLetter();
      if (cancelled) {
        return;
      }

      setLetterLoading(false);

      if (!response.ok) {
        setLetterError(response.message);
        return;
      }

      setTodaysLetter(response.letter);
    }

    void loadLetter();

    return () => {
      cancelled = true;
    };
  }, []);

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

  const memoryCards = useMemo(() => buildMemoryPalaceCards(brain), []);

  return (
    <div className="app app-topnav">
      <header className="topbar">
        <button type="button" className="topbar-brand" onClick={() => setView('today')} aria-label={t('aria.home')}>
          <img
            src="/images/giuseppe-logo.png"
            alt=""
            className="brand-logo"
            width={300}
            height={87}
            draggable={false}
          />
        </button>
        <nav className="topnav" aria-label={t('aria.mainNav')}>
          {VIEWS.map(id => (
            <button
              key={id}
              type="button"
              data-testid={`nav-${id}`}
              className={view === id ? 'active' : undefined}
              onClick={() => setView(id)}
            >
              {t(`nav.${id}`)}
            </button>
          ))}
        </nav>
        <div className="topbar-status">
          <span className="status-dot" />
          <span className="topbar-status-label">{t('status.online')}</span>
        </div>
      </header>

      <div className="app-body">
        <main className={`main space-${view} ${view === 'today' ? 'main-home' : 'main-progressive'}`} role="main">
          <header className={`page-header progressive-header space-header-${view}${view === 'today' ? ' page-header-today' : ''}`}>
            {view !== 'today' && (
              <>
                <div className="space-meta">
                  <div className="kicker">{view === 'memory' ? t('kickers.memory') : t(`nav.${view}`).toUpperCase()}</div>
                  <span className="space-role">{t(`navRole.${view}`)}</span>
                </div>
                <div className="view-title">{t(`viewHeadings.${view}`)}</div>
              </>
            )}
          </header>

          <div className={`view-body progressive-body mental-space mental-space-${view}`}>
            {view === 'today' && (
              <div className="daily-companion editorial-today">
                <div className="companion-editorial-left">
                  <div className="space-meta">
                    <div className="kicker">{t('kickers.today')}</div>
                    <span className="space-role">{t('navRole.today')}</span>
                  </div>
                  <h1 className="view-title companion-headline">{t('viewHeadings.today')}</h1>

                  <section className="companion-panel companion-panel-letter">
                    <div className="kicker">{t('kickers.oneBigMove')}</div>
                    {letterLoading && (
                      <p className="companion-panel-text companion-panel-text--sentence companion-letter-loading">
                        {t('today.loading')}
                      </p>
                    )}
                    {!letterLoading && letterError && (
                      <p className="companion-panel-text companion-panel-text--sentence companion-letter-error">
                        {letterError}
                      </p>
                    )}
                    {!letterLoading && !letterError && todaysLetter && (
                      <p className="companion-panel-text companion-panel-text--sentence">{todaysLetter.sections.oneBigMove}</p>
                    )}
                  </section>

                  <section className="companion-panel">
                    <div className="kicker">{t('kickers.reality')}</div>
                    {letterLoading && (
                      <p className="companion-panel-text companion-panel-text--sentence companion-letter-loading">
                        …
                      </p>
                    )}
                    {!letterLoading && letterError && (
                      <p className="companion-panel-text companion-panel-text--sentence companion-letter-error">
                        —
                      </p>
                    )}
                    {!letterLoading && !letterError && todaysLetter && (
                      <p className="companion-panel-text">{todaysLetter.sections.reality}</p>
                    )}
                  </section>

                  <div className="companion-editorial-extra">
                  {!todayOpportunity && todaysLetter && (
                    <DisclosureTrigger label={t('today.opportunity')} onClick={() => setTodayOpportunity(true)} />
                  )}
                  <DisclosurePanel open={todayOpportunity}>
                    <section className="companion-panel">
                      <div className="kicker">{t('kickers.opportunity')}</div>
                      <p className="companion-panel-text companion-panel-text--sentence">{todaysLetter?.sections.opportunity}</p>
                    </section>
                  </DisclosurePanel>

                  {!todayIgnore && todaysLetter && (
                    <DisclosureTrigger label={t('today.ignoreToday')} onClick={() => setTodayIgnore(true)} />
                  )}
                  <DisclosurePanel open={todayIgnore}>
                    <section className="companion-panel">
                      <div className="kicker">{t('kickers.ignore')}</div>
                      <p className="companion-panel-text companion-panel-text--sentence">{todaysLetter?.sections.ignore}</p>
                    </section>
                  </DisclosurePanel>

                  {!todayNourish && todaysLetter && (
                    <DisclosureTrigger label={t('today.nourish')} onClick={() => setTodayNourish(true)} />
                  )}
                  <DisclosurePanel open={todayNourish}>
                    <section className="companion-panel">
                      <div className="kicker">{t('kickers.nourish')}</div>
                      <p className="companion-panel-text companion-panel-text--sentence">{todaysLetter?.sections.nourish}</p>
                    </section>
                  </DisclosurePanel>

                  {!todayReflect && todaysLetter && (
                    <DisclosureTrigger label={t('today.reflection')} onClick={() => setTodayReflect(true)} />
                  )}
                  <DisclosurePanel open={todayReflect}>
                    <section className="companion-panel">
                      <div className="kicker">{t('kickers.reflection')}</div>
                      <p className="companion-panel-text companion-panel-text--sentence">{todaysLetter?.sections.reflection}</p>
                    </section>
                  </DisclosurePanel>
                  </div>
                </div>

                <div className="companion-presence">
                  <JewelFace />
                </div>

                <div className="companion-editorial-right">
                  <p className={`companion-greeting${letterLoading ? ' companion-greeting--loading' : ''}`}>
                    {letterLoading
                      ? '…'
                      : letterError
                        ? ''
                        : todaysLetter?.sections.greeting ?? ''}
                  </p>
                </div>
              </div>
            )}

            {view === 'decisions' && (
              <div className="decision-room">
                <section className="decision-room-core card card-glow">
                  <div className="kicker">{t('kickers.recommendation')}</div>
                  <h2 className="decision-room-question">{t('decisions.headline')}</h2>
                  <p>{t('decisions.subline')}</p>
                </section>

                {!boardWhy && <DisclosureTrigger label={t('disclosure.why')} onClick={() => setBoardWhy(true)} />}
                <DisclosurePanel open={boardWhy}>
                  <section className="card decision-room-why">
                    <p>{t('decisions.whyBody')}</p>
                  </section>
                </DisclosurePanel>

                {!boardDiscussion && boardWhy && (
                  <DisclosureTrigger label={t('disclosure.boardDiscussion')} onClick={() => setBoardDiscussion(true)} />
                )}
                {!boardDiscussion && !boardWhy && (
                  <DisclosureTrigger label={t('disclosure.boardDiscussion')} onClick={() => { setBoardWhy(true); setBoardDiscussion(true); }} />
                )}
                <DisclosurePanel open={boardDiscussion}>
                  <section className="card">
                    <div className="kicker">{t('kickers.boardDiscussion')}</div>
                    <p>{t('decisions.boardBody')}</p>
                  </section>
                </DisclosurePanel>

                {!boardAdvisors && boardDiscussion && (
                  <DisclosureTrigger label={t('disclosure.advisors')} onClick={() => setBoardAdvisors(true)} />
                )}
                <DisclosurePanel open={boardAdvisors}>
                  <section className="grid board-why-grid">
                    <div className="card"><div className="kicker">{t('kickers.nextMove')}</div><h2>{t('decisions.cardNext')}</h2><p>{t('decisions.cardNextSub')}</p></div>
                    <div className="card"><div className="kicker">{t('kickers.cfo')}</div><h2>{t('decisions.cardCfo')}</h2><p>{t('decisions.cardCfoSub')}</p></div>
                    <div className="card"><div className="kicker">{t('kickers.strategist')}</div><h2>{t('decisions.cardStrategist')}</h2><p>{t('decisions.cardStrategistSub')}</p></div>
                  </section>
                </DisclosurePanel>

                {!boardEvidence && boardAdvisors && (
                  <DisclosureTrigger label={t('disclosure.evidence')} onClick={() => setBoardEvidence(true)} />
                )}
                <DisclosurePanel open={boardEvidence}>
                  <section className="card">
                    <div className="kicker">{t('kickers.evidence')}</div>
                    <ul>{brain.patterns.slice(0, 3).map(item => <li key={item}>{item}</li>)}</ul>
                  </section>
                </DisclosurePanel>

                {!boardConfidence && (
                  <DisclosureTrigger label={t('disclosure.confidence')} onClick={() => setBoardConfidence(true)} />
                )}
                <DisclosurePanel open={boardConfidence}>
                  <section className="card">
                    <div className="kicker">{t('kickers.confidence')}</div>
                    <div className="potential-score">{todayOpp.confidenceScore}</div>
                  </section>
                </DisclosurePanel>

                {!boardPurpose && (
                  <DisclosureTrigger label={t('disclosure.explorePurpose')} onClick={() => setBoardPurpose(true)} />
                )}
                <DisclosurePanel open={boardPurpose}>
                  <section className="hero">
                    <div className="card card-glow">
                      <div className="kicker">{t('kickers.northStar')}</div>
                      <h2>{brain.north_star}</h2>
                    </div>
                    <div className="card">
                      <div className="kicker">{t('kickers.purposeEngine')}</div>
                      <h2>{brain.manifesto}</h2>
                      <p>{t('decisions.mission2036')}: {brain.mission_2036.toLowerCase()}</p>
                    </div>
                  </section>
                </DisclosurePanel>

                <div className="ritual-flow decisions-form-flow">
                  <RitualStep step={1} label={t('kickers.decisionEngine')} isLast>
                    <h2>{t('decisions.askBoard')}</h2>
                    <label>{t('decisions.decisionLabel')}</label>
                    <input
                      className="input"
                      value={decision}
                      onChange={e => setDecision(e.target.value)}
                      placeholder={t('decisions.decisionPlaceholder')}
                    />
                    <label>{t('decisions.reasonLabel')}</label>
                    <textarea
                      className="textarea"
                      value={reason}
                      onChange={e => setReason(e.target.value)}
                      placeholder={t('decisions.reasonPlaceholder')}
                    />
                    <button
                      className="primary"
                      type="button"
                      disabled={decisionLoading || !decision.trim()}
                      onClick={() => void handleAskBoard()}
                    >
                      {decisionLoading ? t('decisions.submitting') : t('decisions.submit')}
                    </button>
                    {decisionError && <p className="decision-error">{decisionError}</p>}
                  </RitualStep>

                  {decisionResult && (
                    <DecisionResultDisclosure
                      key={`${decisionResult.categoryLabel}-${decisionResult.nextAction}-${decisionResult.confidenceScore}`}
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
                    <div className="kicker">{t('kickers.insight')}</div>
                    <h2>{awareness.insight}</h2>
                  </section>

                  <div className="discovery-trail">
                    {!awarenessWhy && <DisclosureTrigger label={t('disclosure.tellMeMore')} onClick={() => setAwarenessWhy(true)} />}
                    <DisclosurePanel open={awarenessWhy}>
                      <div className="card discovery-panel">
                        <p>{awareness.whyItMatters}</p>
                      </div>
                    </DisclosurePanel>

                    {!awarenessEvidence && awarenessWhy && (
                      <DisclosureTrigger label={t('disclosure.showEvidence')} onClick={() => setAwarenessEvidence(true)} />
                    )}
                    {!awarenessEvidence && !awarenessWhy && (
                      <DisclosureTrigger label={t('disclosure.showEvidence')} onClick={() => { setAwarenessWhy(true); setAwarenessEvidence(true); }} />
                    )}
                    <DisclosurePanel open={awarenessEvidence}>
                      <div className="card discovery-panel">
                        <div className="kicker">{t('kickers.evidence')}</div>
                        <ul>{awareness.evidence.map(item => <li key={item}>{item}</li>)}</ul>
                        <div className="kicker">{t('kickers.riskIfIgnored')}</div>
                        <p>{awareness.riskIfIgnored}</p>
                      </div>
                    </DisclosurePanel>

                    {!awarenessReflect && awarenessEvidence && (
                      <DisclosureTrigger label={t('disclosure.reflect')} onClick={() => setAwarenessReflect(true)} />
                    )}
                    <DisclosurePanel open={awarenessReflect}>
                      <div className="card discovery-panel">
                        <div className="kicker">{t('kickers.reflect')}</div>
                        <p>{awareness.reflectionQuestion}</p>
                      </div>
                    </DisclosurePanel>

                    {!awarenessAction && (
                      <DisclosureTrigger label={t('disclosure.suggestedAction')} onClick={() => setAwarenessAction(true)} />
                    )}
                    <DisclosurePanel open={awarenessAction}>
                      <div className="card discovery-panel">
                        <div className="kicker">{t('kickers.recommendedAction')}</div>
                        <p>{awareness.recommendedAction}</p>
                        <div className="kicker">{t('kickers.confidence')}</div>
                        <div className="potential-score">{awareness.confidenceScore}</div>
                      </div>
                    </DisclosurePanel>
                  </div>
                </div>

                {!discoverFinance && (
                  <DisclosureTrigger label={t('disclosure.freedomFinance')} onClick={() => setDiscoverFinance(true)} />
                )}
                <DisclosurePanel open={discoverFinance}>
                <div className="freedom-cockpit discover-finance">
                  <section className="cockpit-gauge card card-glow">
                    <div className="kicker">{t('kickers.freedomScore')}</div>
                    <div className="freedom-gauge-ring">
                      <div className="potential-score">72</div>
                    </div>
                    <p>{t('discover.freedomSubline')}</p>
                  </section>

                  <section className="card cockpit-recommendation">
                    <div className="kicker">{t('kickers.recommendation')}</div>
                    <h2>{t('discover.recHeadline')}</h2>
                    <p>{t('discover.recSubline')}</p>
                  </section>

                  {!financeGoals && <DisclosureTrigger label={t('disclosure.goals')} onClick={() => setFinanceGoals(true)} />}
                  <DisclosurePanel open={financeGoals}>
                    <div className="card">
                      <div className="kicker">{t('kickers.goals')}</div>
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
                  <div className="kicker">{t('kickers.todaysProjectRecommendation')}</div>
                  <h2>{projectName}</h2>
                  <p>{brain.projects[projectName as keyof typeof brain.projects].role}</p>
                </section>

                {!projectsWhy && <DisclosureTrigger label={t('disclosure.why')} onClick={() => setProjectsWhy(true)} />}
                <DisclosurePanel open={projectsWhy}>
                  <section className="card">
                    <div className="kicker">{t('kickers.strategist')}</div>
                    <h2>{t('create.strategistHeadline')}</h2>
                    <p>{t('create.strategistSubline')}</p>
                  </section>
                </DisclosurePanel>

                <ProjectsListDisclosure />
                <PotentialPanelDisclosure />
              </div>
            )}

            {view === 'memory' && (
              <div className="memory-palace">
                <div className="memory-palace-grid" role="list">
                  {memoryCards.map(card => (
                    <article
                      key={card.label}
                      className="memory-card"
                      role="listitem"
                      aria-labelledby={`memory-${card.label}`}
                    >
                      <h3
                        id={`memory-${card.label}`}
                        className={`memory-card-label${card.accent ? ' memory-card-label--accent' : ''}`}
                      >
                        {card.label}
                      </h3>
                      <p className="memory-card-text">{card.text}</p>
                    </article>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>

        <footer className="footer">
          <p>{t('footer')}</p>
        </footer>
      </div>
    </div>
  );
}
