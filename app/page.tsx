'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import brain from '../memory/giuseppe_brain.json';
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
import LivingAvatar from './components/LivingAvatar';
import { LanguageSwitch } from './components/LanguageSwitch';
import { useLanguage } from './lib/i18n/LanguageContext';

type View = 'today' | 'decisions' | 'insights' | 'create' | 'memory';

const VIEWS: View[] = ['today', 'decisions', 'insights', 'create', 'memory'];

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

  const [todayUnderstand, setTodayUnderstand] = useState(false);

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

  const [boardPurpose, setBoardPurpose] = useState(false);

  const [projectsWhy, setProjectsWhy] = useState(false);

  const [insightsPatterns, setInsightsPatterns] = useState(false);

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
        <LanguageSwitch className="language-switch-topbar" />
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

                  <p className="companion-section-question">{t('sectionQuestions.today')}</p>

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
                    {letterLoading && <p className="companion-panel-text companion-letter-loading">…</p>}
                    {!letterLoading && letterError && <p className="companion-panel-text companion-letter-error">—</p>}
                    {!letterLoading && !letterError && todaysLetter && (
                      <p className="companion-panel-text">{todaysLetter.sections.reality}</p>
                    )}
                  </section>

                  {!letterLoading && !letterError && todaysLetter && (
                    <div className="companion-brief-grid">
                      {([
                        ['opportunity', t('kickers.opportunity'), todaysLetter.sections.opportunity],
                        ['ignore', t('kickers.ignore'), todaysLetter.sections.ignore],
                        ['nourish', t('kickers.nourish'), todaysLetter.sections.nourish],
                        ['reflection', t('kickers.reflection'), todaysLetter.sections.reflection]
                      ] as const).map(([key, label, text]) => (
                        <section className="companion-panel companion-panel--compact" key={key}>
                          <div className="kicker">{label}</div>
                          <p className="companion-panel-text companion-panel-text--sentence">{text}</p>
                        </section>
                      ))}
                    </div>
                  )}

                  {!todayUnderstand && todaysLetter && (
                    <DisclosureTrigger label={t('today.understand')} onClick={() => setTodayUnderstand(true)} />
                  )}
                  <DisclosurePanel open={todayUnderstand}>
                    <section className="companion-panel">
                      <div className="kicker">{t('disclosure.why')}</div>
                      <p className="companion-panel-text">{todaysLetter?.pipeline.trajectoryNote ?? t('today.briefingNote')}</p>
                      <div className="kicker">{t('disclosure.evidence')}</div>
                      <p className="companion-panel-text">{todaysLetter?.pipeline.confidenceNote ?? '—'}</p>
                      <div className="kicker">{t('today.trajectoryImpact')}</div>
                      <p className="companion-panel-text">
                        {todaysLetter
                          ? `${todaysLetter.pipeline.trajectoryApproved} approved · ${todaysLetter.pipeline.trajectoryFiltered} filtered`
                          : '—'}
                      </p>
                      <div className="kicker">{t('disclosure.confidence')}</div>
                      <p className="companion-panel-text">{todaysLetter?.pipeline.qualityConfidence ?? '—'}</p>
                      <div className="kicker">{t('today.possibleActions')}</div>
                      <p className="companion-panel-text">{todaysLetter?.sections.opportunity ?? '—'}</p>
                    </section>
                  </DisclosurePanel>
                </div>

                <div className="companion-presence">
                  <LivingAvatar />
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
                <p className="section-question">{t('sectionQuestions.decisions')}</p>

                <div className="ritual-flow decisions-form-flow">
                  <RitualStep step={1} label={t('kickers.decisionEngine')} isLast>
                    <h2>{t('decisions.headline')}</h2>
                    <p>{t('decisions.subline')}</p>
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
                    {decisionLoading && <p className="decision-simulating">{t('decisions.simulating')}</p>}
                    {decisionError && <p className="decision-error">{decisionError}</p>}
                  </RitualStep>

                  {decisionResult && (
                    <>
                      <section className="card decision-scenario-note">
                        <div className="kicker">{t('decisions.scenarioTitle')}</div>
                        <p>{t('decisions.scenarioNote')}</p>
                      </section>
                      <DecisionResultDisclosure
                        key={`${decisionResult.categoryLabel}-${decisionResult.nextAction}-${decisionResult.confidenceScore}`}
                        result={decisionResult}
                      />
                    </>
                  )}
                </div>

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
              </div>
            )}

            {view === 'insights' && (
              <div className="insights-space">
                <p className="section-question">{t('sectionQuestions.insights')}</p>
                <p className="insights-built-over-time">{t('insights.builtOverTime')}</p>

                <div className="quiet-discovery">
                  <section className="discovery-insight card card-glow">
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

                    {!insightsPatterns && (
                      <DisclosureTrigger label={t('disclosure.patterns')} onClick={() => setInsightsPatterns(true)} />
                    )}
                    <DisclosurePanel open={insightsPatterns}>
                      <div className="card discovery-panel">
                        <div className="kicker">{t('insights.patternsTitle')}</div>
                        <ul>{brain.patterns.map(item => <li key={item}>{item}</li>)}</ul>
                        <div className="kicker">{t('insights.blindSpotsTitle')}</div>
                        <p>{brain.patterns[0]}</p>
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
              </div>
            )}

            {view === 'create' && (
              <div className="energy-ecosystem">
                <p className="section-question">{t('sectionQuestions.create')}</p>
                <section className="ecosystem-focus card card-glow">
                  <div className="kicker">{t('create.focusLabel')}</div>
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
                <p className="section-question">{t('sectionQuestions.memory')}</p>
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
          <Link href="/about" className="footer-link">
            {t('footer.about')}
          </Link>
          <div className="footer-status">
            <span className="status-dot" />
            <span className="footer-status-label">{t('status.online')}</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
