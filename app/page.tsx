'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import brain from '../memory/giuseppe_brain.json';
import {
  getCapitalLabel,
  COUNSELLOR_LABELS
} from '../engine/decisionEngine';
import type { DecisionAIResult } from '../lib/brain/decisions/types';
import type { AwarenessInsight } from '../engine/awarenessEngine';
import type { PotentialBrief } from '../engine/potentialEngine';
import type { DailyBriefingResponse } from '../lib/briefing/types';
import { limitWords } from '../lib/todays-letter/parse';
import { MAX_TODAY_ONE_BIG_MOVE_WORDS } from '../lib/todays-letter/prompt';
import { decideViaBrain } from './lib/decideViaBrain';
import { fetchDecisionIntake } from './lib/decisionIntake';
import { fetchCreateViaBrain } from './lib/fetchCreateViaBrain';
import { fetchInsightsViaBrain } from './lib/fetchInsightsViaBrain';
import { fetchTodaysLetter } from './lib/fetchTodaysLetter';
import { formatConfidenceDisplay, formatProgressDisplay } from './lib/formatConfidence';
import { buildMemoryPalaceCards } from './lib/memoryPalaceCards';
import {
  DisclosurePanel,
  DisclosureTrigger
} from './components/Disclosure';
import TodayAvatarNav from './components/TodayAvatarNav';
import { LanguageSwitch } from './components/LanguageSwitch';
import { useLanguage } from './lib/i18n/LanguageContext';

type View = 'today' | 'decisions' | 'insights' | 'create' | 'memory';

const VIEWS: View[] = ['today', 'decisions', 'insights', 'create', 'memory'];

const MEMORY_PRIMARY_LABELS = new Set([
  'MISSION',
  'NORTH STAR',
  'VALUES',
  'PRINCIPLES',
  'PROJECTS',
  'PRIORITIES'
]);


function recommendedProject() {
  const active = Object.entries(brain.projects).filter(([, p]) => p.status === 'active');
  return active[0] ?? Object.entries(brain.projects)[0];
}

function DecisionResultDisclosure({ result }: { result: DecisionAIResult }) {
  const { t } = useLanguage();
  const [openSection, setOpenSection] = useState<'why' | 'board' | 'capitals' | 'better' | null>(null);

  return (
    <div className="result progressive-result space-today-result">
      {openSection === null ? (
        <>
          <div className="kicker">{t('kickers.recommendation')}</div>
          <h3>{result.recommendation}</h3>
          <p>{t('decisionResult.category')}: {result.categoryLabel}</p>
          <div className="potential-score">
            {formatConfidenceDisplay(t, result.confidenceScore, result.confidenceLabel)}
          </div>
          <div className="kicker">{t('decisionResult.nextStep')}</div>
          <p>{result.nextAction}</p>
          <div className="discovery-trail">
            <DisclosureTrigger label={t('disclosure.why')} onClick={() => setOpenSection('why')} />
            <DisclosureTrigger label={t('disclosure.showBoard')} onClick={() => setOpenSection('board')} />
            <DisclosureTrigger label={t('disclosure.capitals')} onClick={() => setOpenSection('capitals')} />
            <DisclosureTrigger label={t('disclosure.betterVersion')} onClick={() => setOpenSection('better')} />
          </div>
        </>
      ) : (
        <>
          <button type="button" className="reading-expand-close" onClick={() => setOpenSection(null)}>
            <span aria-hidden="true">←</span> {t('disclosure.closeReading')}
          </button>
          <DisclosurePanel open={openSection === 'why'}>
            <div className="kicker">{t('decisionResult.whyMatters')}</div>
            <p>{result.whyItMatters}</p>
            <div className="kicker">{t('decisionResult.hiddenNeed')}</div>
            <p><b>{t('decisionResult.hiddenNeedLabel')}:</b> {result.hiddenNeed}</p>
            <p><b>{t('decisionResult.biasLabel')}:</b> {result.bias}</p>
          </DisclosurePanel>
          <DisclosurePanel open={openSection === 'board'}>
            <div className="kicker">{t('kickers.board')}</div>
            {Object.entries(result.counsellors).map(([key, text]) => (
              <p key={key}><b>{COUNSELLOR_LABELS[key as keyof typeof result.counsellors]}:</b> {text}</p>
            ))}
          </DisclosurePanel>
          <DisclosurePanel open={openSection === 'capitals'}>
            <h3>{t('decisionResult.capitalsTitle')}</h3>
            {Object.entries(result.capitals).map(([key, value]) => (
              <p key={key}>
                <b>{getCapitalLabel(key as keyof typeof result.capitals)} ({value.score}):</b> {value.note}
              </p>
            ))}
          </DisclosurePanel>
          <DisclosurePanel open={openSection === 'better'}>
            <h3>{t('decisionResult.betterTitle')}</h3>
            <p>{result.betterVersion}</p>
          </DisclosurePanel>
          <div className="discovery-trail">
            {openSection !== 'why' && (
              <DisclosureTrigger label={t('disclosure.why')} onClick={() => setOpenSection('why')} />
            )}
            {openSection !== 'board' && (
              <DisclosureTrigger label={t('disclosure.showBoard')} onClick={() => setOpenSection('board')} />
            )}
            {openSection !== 'capitals' && (
              <DisclosureTrigger label={t('disclosure.capitals')} onClick={() => setOpenSection('capitals')} />
            )}
            {openSection !== 'better' && (
              <DisclosureTrigger label={t('disclosure.betterVersion')} onClick={() => setOpenSection('better')} />
            )}
          </div>
        </>
      )}
    </div>
  );
}

function PotentialPanelDisclosure({ onOpen }: { onOpen: () => void }) {
  const { t } = useLanguage();
  return <DisclosureTrigger label={t('disclosure.exploreOpportunities')} onClick={onOpen} />;
}

function PotentialPanelFocus({
  onClose,
  potential
}: {
  onClose: () => void;
  potential: PotentialBrief;
}) {
  const { t } = useLanguage();
  const today = potential.todaysOpportunity;

  return (
    <div className="reading-focus-view">
      <button type="button" className="reading-expand-close" onClick={onClose}>
        <span aria-hidden="true">←</span> {t('disclosure.closeReading')}
      </button>
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
          <div className="potential-score">
            {formatConfidenceDisplay(t, today.confidenceScore, today.confidenceLabel)}
          </div>
          <p>
            {today.hasEnoughData && today.totalScore !== null
              ? `${t('potential.score')} ${Math.round(today.totalScore)} · ${today.sourceProject ?? t('potential.system')}`
              : formatProgressDisplay(t)}
          </p>
        </div>
      </section>
      <section className="potential-grid">
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
      </section>
    </div>
  );
}

function ProjectsListDisclosure({ onOpen }: { onOpen: () => void }) {
  const { t } = useLanguage();
  return <DisclosureTrigger label={t('disclosure.openProjects')} onClick={onOpen} />;
}

function ProjectsListFocus({
  onClose,
  selected,
  onSelect
}: {
  onClose: () => void;
  selected: string | null;
  onSelect: (name: string) => void;
}) {
  const { t } = useLanguage();

  return (
    <div className="reading-focus-view">
      <button type="button" className="reading-expand-close" onClick={onClose}>
        <span aria-hidden="true">←</span> {t('disclosure.closeReading')}
      </button>
      <section className="projects-grid project-map">
        {Object.entries(brain.projects).map(([name, project]) => (
          <button
            type="button"
            key={name}
            className={`card project-select-card ${selected === name ? 'selected' : ''}`}
            onClick={() => onSelect(name)}
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
          <p>{t('disclosure.progress')}: {formatProgressDisplay(t)}</p>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const { t, locale } = useLanguage();
  const [view, setView] = useState<View>('today');
  const [awareness, setAwareness] = useState<AwarenessInsight | null>(null);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [insightsError, setInsightsError] = useState<string | null>(null);
  const [potential, setPotential] = useState<PotentialBrief | null>(null);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [projectName] = recommendedProject();

  const [decision, setDecision] = useState('');
  const [intakeAnswers, setIntakeAnswers] = useState<Record<string, string>>({});
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [intakeQuestion, setIntakeQuestion] = useState<string | null>(null);
  const [currentQuestionId, setCurrentQuestionId] = useState<string | null>(null);
  const [intakePhase, setIntakePhase] = useState<'opening' | 'listening' | 'reasoning'>('opening');
  const [decisionResult, setDecisionResult] = useState<DecisionAIResult | null>(null);
  const [decisionLoading, setDecisionLoading] = useState(false);
  const [decisionError, setDecisionError] = useState<string | null>(null);

  async function runDecisionRecommendation(
    decisionText: string,
    answers: Record<string, string>
  ): Promise<void> {
    setIntakePhase('reasoning');
    setDecisionLoading(true);
    setDecisionError(null);
    setDecisionResult(null);

    const response = await decideViaBrain(decisionText, answers, locale);

    setDecisionLoading(false);

    if (!response.ok) {
      setDecisionError(response.message);
      setIntakePhase('listening');
      return;
    }

    setDecisionResult(response.decision);
    setIntakePhase('opening');
  }

  async function handleDecisionContinue() {
    const draft = intakePhase === 'opening' ? decision.trim() : currentAnswer.trim();
    if (!draft) {
      return;
    }

    setDecisionError(null);
    setDecisionLoading(true);

    if (intakePhase === 'opening') {
      const intake = await fetchDecisionIntake({
        decision: draft,
        answers: {},
        locale
      });

      setDecisionLoading(false);

      if (!intake.ok) {
        setDecisionError(intake.message);
        return;
      }

      if (intake.intake.status === 'ready') {
        await runDecisionRecommendation(draft, {});
        return;
      }

      setDecision(draft);
      setIntakePhase('listening');
      setIntakeQuestion(intake.intake.question?.text ?? null);
      setCurrentQuestionId(intake.intake.question?.id ?? null);
      setCurrentAnswer('');
      return;
    }

    const nextAnswers = currentQuestionId
      ? { ...intakeAnswers, [currentQuestionId]: draft }
      : intakeAnswers;

    const intake = await fetchDecisionIntake({
      decision,
      answers: nextAnswers,
      locale
    });

    if (!intake.ok) {
      setDecisionLoading(false);
      setDecisionError(intake.message);
      return;
    }

    if (intake.intake.status === 'ready') {
      setIntakeAnswers(nextAnswers);
      setIntakeQuestion(null);
      setCurrentQuestionId(null);
      setCurrentAnswer('');
      await runDecisionRecommendation(decision, nextAnswers);
      return;
    }

    setIntakeAnswers(nextAnswers);
    setIntakeQuestion(intake.intake.question?.text ?? null);
    setCurrentQuestionId(intake.intake.question?.id ?? null);
    setCurrentAnswer('');
    setDecisionLoading(false);
  }

  function resetDecisionFlow() {
    setDecision('');
    setIntakeAnswers({});
    setCurrentAnswer('');
    setIntakeQuestion(null);
    setCurrentQuestionId(null);
    setIntakePhase('opening');
    setDecisionResult(null);
    setDecisionError(null);
    setDecisionLoading(false);
  }

  const [memoryExpanded, setMemoryExpanded] = useState(false);
  const [insightsFocus, setInsightsFocus] = useState<
    'why' | 'patterns' | 'evidence' | 'reflect' | 'action' | null
  >(null);

  const [todaysLetter, setTodaysLetter] = useState<DailyBriefingResponse | null>(null);
  const [letterLoading, setLetterLoading] = useState(true);
  const [letterError, setLetterError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadInsights() {
      setInsightsLoading(true);
      setInsightsError(null);

      const response = await fetchInsightsViaBrain(locale);
      if (cancelled) {
        return;
      }

      setInsightsLoading(false);

      if (!response.ok) {
        setInsightsError(response.message);
        return;
      }

      setAwareness(response.awareness);
    }

    void loadInsights();

    return () => {
      cancelled = true;
    };
  }, [locale]);

  useEffect(() => {
    let cancelled = false;

    async function loadCreate() {
      setCreateLoading(true);
      setCreateError(null);

      const response = await fetchCreateViaBrain(locale);
      if (cancelled) {
        return;
      }

      setCreateLoading(false);

      if (!response.ok) {
        setCreateError(response.message);
        return;
      }

      setPotential(response.potential);
    }

    void loadCreate();

    return () => {
      cancelled = true;
    };
  }, [locale]);

  useEffect(() => {
    let cancelled = false;

    async function loadLetter() {
      setLetterLoading(true);
      setLetterError(null);

      const response = await fetchTodaysLetter(locale);
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
  }, [locale]);

  const [createFocus, setCreateFocus] = useState<'projects' | 'potential' | 'why' | null>(null);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [decisionsFocus, setDecisionsFocus] = useState<'form' | 'purpose' | null>('form');

  const memoryCards = useMemo(() => buildMemoryPalaceCards(brain), []);
  const memoryPrimaryCards = useMemo(
    () => memoryCards.filter(card => MEMORY_PRIMARY_LABELS.has(card.label)),
    [memoryCards]
  );
  const memoryExtraCards = useMemo(
    () => memoryCards.filter(card => !MEMORY_PRIMARY_LABELS.has(card.label)),
    [memoryCards]
  );

  useEffect(() => {
    setMemoryExpanded(false);
    setInsightsFocus(null);
    setDecisionsFocus('form');
    setCreateFocus(null);
    setSelectedProject(null);
    setDecision('');
    setIntakeAnswers({});
    setCurrentAnswer('');
    setIntakeQuestion(null);
    setCurrentQuestionId(null);
    setIntakePhase('opening');
    setDecisionResult(null);
    setDecisionError(null);
    setDecisionLoading(false);
  }, [view]);

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
              <div className="today-calm">
                <div className="today-action" data-testid="today-action">
                  {letterLoading && (
                    <p className="today-action-text today-action-text--loading">{t('today.loading')}</p>
                  )}
                  {!letterLoading && letterError && (
                    <p className="today-action-text today-action-text--error">{letterError}</p>
                  )}
                  {!letterLoading && !letterError && todaysLetter && (
                    <p className="today-action-text">
                      {limitWords(todaysLetter.sections.oneBigMove, MAX_TODAY_ONE_BIG_MOVE_WORDS)}
                    </p>
                  )}
                </div>
                <div className="today-presence">
                  <TodayAvatarNav onNavigate={setView} />
                </div>
              </div>
            )}

            {view === 'decisions' && (
              <div className={`decision-room${decisionsFocus === 'purpose' ? ' mental-space--reading' : ''}`}>
                {decisionsFocus === 'purpose' ? (
                  <div className="reading-focus-view">
                    <button type="button" className="reading-expand-close" onClick={() => setDecisionsFocus('form')}>
                      <span aria-hidden="true">←</span> {t('disclosure.closeReading')}
                    </button>
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
                  </div>
                ) : (
                  <>
                    {!decisionResult && (
                      <div className="decision-conversation">
                        {intakePhase === 'opening' && (
                          <>
                            <p className="decision-opening-prompt">{t('decisions.openingPrompt')}</p>
                            <input
                              className="input decision-open-input"
                              data-testid="decision-open-input"
                              value={decision}
                              onChange={e => setDecision(e.target.value)}
                              placeholder={t('decisions.openingPlaceholder')}
                              onKeyDown={e => {
                                if (e.key === 'Enter') {
                                  void handleDecisionContinue();
                                }
                              }}
                            />
                          </>
                        )}

                        {intakePhase === 'listening' && (
                          <>
                            <p className="decision-context-line">{decision}</p>
                            {intakeQuestion && (
                              <p className="decision-followup-question" data-testid="decision-followup">
                                {intakeQuestion}
                              </p>
                            )}
                            <input
                              className="input decision-followup-input"
                              data-testid="decision-followup-input"
                              value={currentAnswer}
                              onChange={e => setCurrentAnswer(e.target.value)}
                              placeholder={t('decisions.followupPlaceholder')}
                              onKeyDown={e => {
                                if (e.key === 'Enter') {
                                  void handleDecisionContinue();
                                }
                              }}
                            />
                          </>
                        )}

                        {intakePhase === 'reasoning' && (
                          <p className="decision-reasoning">{t('decisions.reasoning')}</p>
                        )}

                        {intakePhase !== 'reasoning' && (
                          <button
                            className="primary decision-continue"
                            type="button"
                            data-testid="decision-continue"
                            disabled={
                              decisionLoading ||
                              (intakePhase === 'opening' ? !decision.trim() : !currentAnswer.trim())
                            }
                            onClick={() => void handleDecisionContinue()}
                          >
                            {decisionLoading ? t('decisions.simulating') : t('decisions.continue')}
                          </button>
                        )}

                        {decisionError && <p className="decision-error">{decisionError}</p>}
                      </div>
                    )}

                    {decisionResult && (
                      <div className="decision-conversation">
                        <DecisionResultDisclosure
                          key={`${decisionResult.categoryLabel}-${decisionResult.nextAction}-${decisionResult.confidenceScore}`}
                          result={decisionResult}
                        />
                        <DisclosureTrigger
                          label={t('decisions.newDecision')}
                          onClick={resetDecisionFlow}
                        />
                      </div>
                    )}

                    <DisclosureTrigger
                      label={t('disclosure.explorePurpose')}
                      onClick={() => setDecisionsFocus('purpose')}
                    />
                  </>
                )}
              </div>
            )}

            {view === 'insights' && (
              <div className={`insights-space${insightsFocus ? ' mental-space--reading' : ''}`}>
                {insightsLoading && <p className="companion-letter-loading">…</p>}
                {insightsError && <p className="companion-letter-error">{insightsError}</p>}

                {!insightsLoading && !insightsError && awareness && insightsFocus === null && (
                  <>
                    <p className="section-question">{t('sectionQuestions.insights')}</p>
                    <p className="insights-built-over-time">{awareness.headline}</p>

                    <section className="discovery-insight card card-glow">
                      <div className="kicker">{t('kickers.insight')}</div>
                      <h2>{awareness.insight}</h2>
                    </section>

                    <div className="discovery-trail">
                      <DisclosureTrigger label={t('disclosure.tellMeMore')} onClick={() => setInsightsFocus('why')} />
                      <DisclosureTrigger label={t('disclosure.patterns')} onClick={() => setInsightsFocus('patterns')} />
                      <DisclosureTrigger label={t('disclosure.showEvidence')} onClick={() => setInsightsFocus('evidence')} />
                      <DisclosureTrigger label={t('disclosure.reflect')} onClick={() => setInsightsFocus('reflect')} />
                      <DisclosureTrigger label={t('disclosure.suggestedAction')} onClick={() => setInsightsFocus('action')} />
                    </div>
                  </>
                )}

                {!insightsLoading && !insightsError && awareness && insightsFocus !== null && (
                  <div className="reading-focus-view">
                    <button type="button" className="reading-expand-close" onClick={() => setInsightsFocus(null)}>
                      <span aria-hidden="true">←</span> {t('disclosure.closeReading')}
                    </button>

                    <DisclosurePanel open={insightsFocus === 'why'}>
                      <div className="card discovery-panel">
                        <p>{awareness.whyItMatters}</p>
                      </div>
                    </DisclosurePanel>

                    <DisclosurePanel open={insightsFocus === 'patterns'}>
                      <div className="card discovery-panel">
                        <div className="kicker">{t('insights.patternsTitle')}</div>
                        <ul>{brain.patterns.map(item => <li key={item}>{item}</li>)}</ul>
                        <div className="kicker">{t('insights.blindSpotsTitle')}</div>
                        <p>{brain.patterns[0]}</p>
                      </div>
                    </DisclosurePanel>

                    <DisclosurePanel open={insightsFocus === 'evidence'}>
                      <div className="card discovery-panel">
                        <div className="kicker">{t('kickers.evidence')}</div>
                        <ul>{awareness.evidence.map(item => <li key={item}>{item}</li>)}</ul>
                        <div className="kicker">{t('kickers.riskIfIgnored')}</div>
                        <p>{awareness.riskIfIgnored}</p>
                      </div>
                    </DisclosurePanel>

                    <DisclosurePanel open={insightsFocus === 'reflect'}>
                      <div className="card discovery-panel">
                        <div className="kicker">{t('kickers.reflect')}</div>
                        <p>{awareness.reflectionQuestion}</p>
                      </div>
                    </DisclosurePanel>

                    <DisclosurePanel open={insightsFocus === 'action'}>
                      <div className="card discovery-panel">
                        <div className="kicker">{t('kickers.recommendedAction')}</div>
                        <p>{awareness.recommendedAction}</p>
                        <div className="kicker">{t('kickers.confidence')}</div>
                        <div className="potential-score">
                          {formatConfidenceDisplay(t, awareness.confidenceScore, awareness.confidenceLabel)}
                        </div>
                      </div>
                    </DisclosurePanel>
                  </div>
                )}
              </div>
            )}

            {view === 'create' && (
              <div className={`energy-ecosystem${createFocus ? ' mental-space--reading' : ''}`}>
                {createFocus === 'potential' && potential && (
                  <PotentialPanelFocus onClose={() => setCreateFocus(null)} potential={potential} />
                )}

                {createFocus === 'potential' && createLoading && <p className="companion-letter-loading">…</p>}
                {createFocus === 'potential' && createError && <p className="companion-letter-error">{createError}</p>}

                {createFocus === 'projects' && (
                  <ProjectsListFocus
                    onClose={() => setCreateFocus(null)}
                    selected={selectedProject}
                    onSelect={setSelectedProject}
                  />
                )}

                {createFocus === 'why' && (
                  <div className="reading-focus-view">
                    <button type="button" className="reading-expand-close" onClick={() => setCreateFocus(null)}>
                      <span aria-hidden="true">←</span> {t('disclosure.closeReading')}
                    </button>
                    <section className="card">
                      <div className="kicker">{t('kickers.strategist')}</div>
                      <h2>{t('create.strategistHeadline')}</h2>
                      <p>{t('create.strategistSubline')}</p>
                    </section>
                  </div>
                )}

                {createFocus === null && (
                  <>
                    <p className="section-question">{t('sectionQuestions.create')}</p>
                    <section className="ecosystem-focus card card-glow">
                      <div className="kicker">{t('create.focusLabel')}</div>
                      <h2>{projectName}</h2>
                      <p>{brain.projects[projectName as keyof typeof brain.projects].role}</p>
                    </section>

                    <DisclosureTrigger label={t('disclosure.why')} onClick={() => setCreateFocus('why')} />
                    <ProjectsListDisclosure onOpen={() => setCreateFocus('projects')} />
                    {!createLoading && !createError && potential && (
                      <PotentialPanelDisclosure onOpen={() => setCreateFocus('potential')} />
                    )}
                    {createLoading && <p className="companion-letter-loading">…</p>}
                    {createError && <p className="companion-letter-error">{createError}</p>}
                  </>
                )}
              </div>
            )}

            {view === 'memory' && (
              <div className={`memory-palace${memoryExpanded ? ' mental-space--reading' : ''}`}>
                {memoryExpanded ? (
                  <div className="reading-focus-view">
                    <button type="button" className="reading-expand-close" onClick={() => setMemoryExpanded(false)}>
                      <span aria-hidden="true">←</span> {t('disclosure.closeReading')}
                    </button>
                    <div className="memory-palace-grid memory-palace-grid--expanded" role="list">
                      {memoryExtraCards.map(card => (
                        <article
                          key={card.label}
                          className="memory-card memory-card--compact"
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
                ) : (
                  <>
                    <p className="section-question">{t('sectionQuestions.memory')}</p>
                    <div className="memory-palace-grid" role="list">
                      {memoryPrimaryCards.map(card => (
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
                    <DisclosureTrigger
                      label={t('disclosure.exploreMemory')}
                      onClick={() => setMemoryExpanded(true)}
                    />
                  </>
                )}
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
