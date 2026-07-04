'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
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
import { MemoryManifesto } from './components/MemoryManifesto';
import {
  DisclosurePanel,
  DisclosureTrigger
} from './components/Disclosure';
import { InsightsStage } from './components/InsightsStage';
import { DecisionIntakePanel } from './components/DecisionIntakePanel';
import { DecisionReviewGate, type DueReviewPayload } from './components/DecisionReviewGate';
import TodayMobileRitual from './components/TodayMobileRitual';
import { TodayDraggablePresence } from './components/TodayDraggablePresence';
import { AppTopbar } from './components/AppTopbar';
import { DevAiControls } from './components/DevAiControls';
import { AiStatusIndicator } from './components/AiStatusIndicator';
import { FooterCredit } from './components/FooterCredit';
import { useLanguage } from './lib/i18n/LanguageContext';
import { isAppView, type AppView } from './lib/views';

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
  const [view, setView] = useState<AppView>('today');
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

  const [insightsFocus, setInsightsFocus] = useState<
    'why' | 'patterns' | 'evidence' | 'reflect' | 'action' | null
  >(null);

  const [todaysLetter, setTodaysLetter] = useState<DailyBriefingResponse | null>(null);
  const [letterLoading, setLetterLoading] = useState(true);
  const [letterError, setLetterError] = useState<string | null>(null);
  const [dueReview, setDueReview] = useState<DueReviewPayload | null>(null);
  const [reviewCheckDone, setReviewCheckDone] = useState(false);
  const [reviewGateCleared, setReviewGateCleared] = useState(false);

  useEffect(() => {
    const syncFromHash = () => {
      const raw = window.location.hash.replace(/^#/, '');
      if (isAppView(raw)) {
        setView(raw);
      }
    };

    syncFromHash();
    window.addEventListener('hashchange', syncFromHash);
    return () => window.removeEventListener('hashchange', syncFromHash);
  }, []);

  useEffect(() => {
    if (view !== 'insights') {
      return;
    }

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
  }, [view, locale]);

  useEffect(() => {
    if (view !== 'today') {
      setReviewCheckDone(false);
      return;
    }

    let cancelled = false;

    async function loadDueReview() {
      const response = await fetch('/api/decisions/reviews/due');
      const body = await response.json().catch(() => ({}));

      if (cancelled) {
        return;
      }

      if (body.due) {
        setDueReview(body.due as DueReviewPayload);
        setReviewGateCleared(false);
      } else {
        setDueReview(null);
        setReviewGateCleared(true);
      }

      setReviewCheckDone(true);
    }

    void loadDueReview();

    return () => {
      cancelled = true;
    };
  }, [view]);

  async function loadCreateBrief(analyze = false) {
    setCreateLoading(true);
    setCreateError(null);

    const response = await fetchCreateViaBrain(locale, { analyze });
    setCreateLoading(false);

    if (!response.ok) {
      setCreateError(response.message);
      return;
    }

    setPotential(response.potential);
  }

  useEffect(() => {
    let cancelled = false;

    async function loadLetter(regenerate = false) {
      if (view !== 'today' || !reviewCheckDone || (dueReview && !reviewGateCleared)) {
        return;
      }

      setLetterLoading(true);
      setLetterError(null);

      const response = await fetchTodaysLetter(locale, { regenerate });
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

    void loadLetter(false);

    return () => {
      cancelled = true;
    };
  }, [locale, view, reviewCheckDone, dueReview, reviewGateCleared]);

  async function handleRegenerateBriefing() {
    setLetterLoading(true);
    setLetterError(null);

    const response = await fetchTodaysLetter(locale, { regenerate: true });
    setLetterLoading(false);

    if (!response.ok) {
      setLetterError(response.message);
      return;
    }

    setTodaysLetter(response.letter);
  }

  const [createFocus, setCreateFocus] = useState<'projects' | 'potential' | 'why' | null>(null);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [decisionsFocus, setDecisionsFocus] = useState<'form' | 'purpose' | null>('form');

  useEffect(() => {
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
      <AppTopbar mode="spa" activeView={view} onNavigate={setView} />

      <div className="app-body">
        <main className={`main space-${view} ${view === 'today' ? 'main-home' : 'main-progressive'}${view === 'decisions' ? ' main-decisions' : ''}${view === 'insights' ? ' main-insights' : ''}${view === 'memory' ? ' main-memory' : ''}`} role="main">
          <header className={`page-header progressive-header space-header-${view}${view === 'today' ? ' page-header-today' : ''}${view === 'decisions' ? ' page-header-decisions' : ''}${view === 'insights' ? ' page-header-insights' : ''}${view === 'memory' ? ' page-header-memory' : ''}`}>
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
              <>
                {reviewCheckDone && dueReview && !reviewGateCleared ? (
                  <div className="today-review-stage">
                    <DecisionReviewGate
                      review={dueReview}
                      onComplete={() => {
                        setReviewGateCleared(true);
                        setDueReview(null);
                      }}
                    />
                  </div>
                ) : (
                  <>
                    <TodayDraggablePresence onNavigate={setView}>
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
                    </TodayDraggablePresence>
                    <TodayMobileRitual
                      letterLoading={letterLoading}
                      letterError={letterError}
                      todaysLetter={todaysLetter}
                      onNavigate={setView}
                    />
                  </>
                )}
              </>
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
                      <DecisionIntakePanel
                        intakePhase={intakePhase}
                        decision={decision}
                        currentAnswer={currentAnswer}
                        intakeQuestion={intakeQuestion}
                        decisionLoading={decisionLoading}
                        decisionError={decisionError}
                        onDecisionChange={setDecision}
                        onAnswerChange={setCurrentAnswer}
                        onContinue={() => void handleDecisionContinue()}
                      />
                    )}

                    {decisionResult && (
                      <div className="decision-result-stage">
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
                      className="disclosure-trigger decision-purpose-link"
                      label={t('disclosure.explorePurpose')}
                      onClick={() => setDecisionsFocus('purpose')}
                    />
                  </>
                )}
              </div>
            )}

            {view === 'insights' && (
              <div className={`insights-space${insightsFocus ? ' mental-space--reading' : ''}`}>
                <InsightsStage
                  loading={insightsLoading}
                  error={insightsError}
                  awareness={awareness}
                  focus={insightsFocus}
                  patterns={brain.patterns}
                  onFocusChange={setInsightsFocus}
                />
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
                    <PotentialPanelDisclosure
                      onOpen={() => {
                        setCreateFocus('potential');
                        if (!potential && !createLoading) {
                          void loadCreateBrief(false);
                        }
                      }}
                    />
                    {createLoading && <p className="companion-letter-loading">…</p>}
                    {createError && <p className="companion-letter-error">{createError}</p>}
                  </>
                )}
              </div>
            )}

            {view === 'memory' && (
              <div className="memory-space">
                <MemoryManifesto />
              </div>
            )}
          </div>
        </main>

        <footer className="footer">
          <div className="footer-start">
            <DevAiControls letterLoading={letterLoading} onRegenerate={() => void handleRegenerateBriefing()} />
            <Link href="/about" className="footer-link">
              {t('footer.about')}
            </Link>
          </div>
          <FooterCredit />
          <div className="footer-end">
            <AiStatusIndicator />
          </div>
        </footer>
      </div>
    </div>
  );
}
