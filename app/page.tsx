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
import type { TodayResponse } from '../lib/today/types';
import { decideViaBrain } from './lib/decideViaBrain';
import { fetchDecisionIntake } from './lib/decisionIntake';
import { fetchCreateViaBrain } from './lib/fetchCreateViaBrain';
import { fetchInsightsViaBrain } from './lib/fetchInsightsViaBrain';
import { fetchToday } from './lib/fetchToday';
import { fetchWeeklyBoard } from './lib/fetchWeeklyBoard';
import { formatConfidenceDisplay, formatProgressDisplay } from './lib/formatConfidence';
import { MemoryManifesto } from './components/MemoryManifesto';
import {
  DisclosurePanel,
  DisclosureTrigger
} from './components/Disclosure';
import { InsightsStage } from './components/InsightsStage';
import { BrandsStage } from './components/BrandsStage';
import { CreateStage } from './components/CreateStage';
import { DecisionIntakePanel } from './components/DecisionIntakePanel';
import { DecisionReviewGate, type DueReviewPayload } from './components/DecisionReviewGate';
import {
  WeeklyBoardCard,
  dismissWeeklyBoard,
  isWeeklyBoardDismissed
} from './components/WeeklyBoardCard';
import type { WeeklyBoardResponse } from '../lib/weekly-board/types';
import { weeklyBoardWeekKey } from '../lib/weekly-board/cache';
import TodayMobileShell from './components/TodayMobileShell';
import { TodayDraggablePresence } from './components/TodayDraggablePresence';
import { TodayExperience } from './components/TodayExperience';
import { AiOutputCard } from './components/AiOutputCard';
import { AppTopbar } from './components/AppTopbar';
import { DevAiControls } from './components/DevAiControls';
import { FooterCredit } from './components/FooterCredit';
import { GlobalContentStudio } from './components/GlobalContentStudio';
import { useLanguage } from './lib/i18n/LanguageContext';
import { isAppView, type AppView } from './lib/views';

function recommendedProject() {
  const active = Object.entries(brain.projects).filter(([, p]) => p.status === 'active');
  return active[0] ?? Object.entries(brain.projects)[0];
}

function DecisionResultDisclosure({ result }: { result: DecisionAIResult }) {
  const { t } = useLanguage();
  const [openSection, setOpenSection] = useState<'why' | 'board' | 'capitals' | 'better' | 'risks' | null>(null);

  if (openSection === null) {
    return (
      <div className="result decision-result-stage">
        <AiOutputCard
          kicker={t('aiCards.decisionRecommendation')}
          title={result.recommendation}
          body={result.whyItMatters}
          nextAction={result.nextAction}
          nextActionKicker={t('decisionResult.nextStep')}
          testId="decision-ai-card"
        >
          <p>{t('decisionResult.category')}: {result.categoryLabel}</p>
          <div className="potential-score">
            {formatConfidenceDisplay(t, result.confidenceScore, result.confidenceLabel)}
          </div>
          {result.alignment ? (
            <>
              <div className="kicker">{t('aiCards.alignment')}</div>
              <p>{result.alignment}</p>
            </>
          ) : null}
          {result.risks?.length ? (
            <>
              <div className="kicker">{t('aiCards.risks')}</div>
              <ul>{result.risks.map(risk => <li key={risk}>{risk}</li>)}</ul>
            </>
          ) : null}
          {result.emotionalBiasCheck ? (
            <>
              <div className="kicker">{t('aiCards.emotionalBias')}</div>
              <p>{result.emotionalBiasCheck}</p>
            </>
          ) : null}
          {result.missingInformation?.length ? (
            <>
              <div className="kicker">{t('aiCards.missingInfo')}</div>
              <ul>{result.missingInformation.map(item => <li key={item}>{item}</li>)}</ul>
            </>
          ) : null}
          <div className="discovery-trail">
            <DisclosureTrigger label={t('disclosure.why')} onClick={() => setOpenSection('why')} />
            <DisclosureTrigger label={t('disclosure.showBoard')} onClick={() => setOpenSection('board')} />
            <DisclosureTrigger label={t('disclosure.capitals')} onClick={() => setOpenSection('capitals')} />
            <DisclosureTrigger label={t('disclosure.betterVersion')} onClick={() => setOpenSection('better')} />
          </div>
        </AiOutputCard>
      </div>
    );
  }

  return (
    <div className="result progressive-result space-today-result">
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
    </div>
  );
}

export default function Home() {
  const { t, locale } = useLanguage();
  const [view, setView] = useState<AppView>('today');
  const [awareness, setAwareness] = useState<AwarenessInsight | null>(null);
  const [insightCard, setInsightCard] = useState<{
    title: string;
    body: string;
    nextAction: string;
  } | null>(null);
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

  const [todayExperience, setTodayExperience] = useState<TodayResponse | null>(null);
  const [todayLoading, setTodayLoading] = useState(true);
  const [todayError, setTodayError] = useState<string | null>(null);
  const [dueReview, setDueReview] = useState<DueReviewPayload | null>(null);
  const [reviewCheckDone, setReviewCheckDone] = useState(false);
  const [reviewGateCleared, setReviewGateCleared] = useState(false);
  const [weeklyBoard, setWeeklyBoard] = useState<WeeklyBoardResponse | null>(null);
  const [weeklyBoardLoading, setWeeklyBoardLoading] = useState(false);
  const [weeklyBoardDismissed, setWeeklyBoardDismissed] = useState(false);

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
      if (response.card) {
        setInsightCard(response.card);
      } else {
        setInsightCard({
          title: response.awareness.headline,
          body: response.awareness.insight,
          nextAction: response.awareness.recommendedAction
        });
      }
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

    async function loadToday(regenerate = false) {
      if (view !== 'today' || !reviewCheckDone || (dueReview && !reviewGateCleared)) {
        return;
      }

      setTodayLoading(true);
      setTodayError(null);

      const response = await fetchToday(locale, { regenerate });
      if (cancelled) {
        return;
      }

      setTodayLoading(false);

      if (!response.ok) {
        setTodayError(response.message);
        return;
      }

      setTodayExperience(response.today);
    }

    void loadToday(false);

    return () => {
      cancelled = true;
    };
  }, [locale, view, reviewCheckDone, dueReview, reviewGateCleared]);

  useEffect(() => {
    if (view !== 'today' || !reviewCheckDone || (dueReview && !reviewGateCleared)) {
      return;
    }

    const weekKey = weeklyBoardWeekKey();
    if (isWeeklyBoardDismissed(weekKey)) {
      setWeeklyBoardDismissed(true);
      setWeeklyBoard(null);
      return;
    }

    setWeeklyBoardDismissed(false);
    let cancelled = false;

    async function loadWeeklyBoard() {
      setWeeklyBoardLoading(true);
      const response = await fetchWeeklyBoard(locale);
      if (cancelled) {
        return;
      }

      setWeeklyBoardLoading(false);

      if (response.ok) {
        setWeeklyBoard(response.board);
      }
    }

    void loadWeeklyBoard();

    return () => {
      cancelled = true;
    };
  }, [locale, view, reviewCheckDone, dueReview, reviewGateCleared]);

  async function handleRegenerateToday() {
    setTodayLoading(true);
    setTodayError(null);

    const response = await fetchToday(locale, { regenerate: true });
    setTodayLoading(false);

    if (!response.ok) {
      setTodayError(response.message);
      return;
    }

    setTodayExperience(response.today);
  }

  const [brandsFocus, setBrandsFocus] = useState<'projects' | 'potential' | 'why' | null>(null);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [decisionsFocus, setDecisionsFocus] = useState<'form' | 'purpose' | null>('form');

  useEffect(() => {
    setInsightsFocus(null);
    setDecisionsFocus('form');
    setBrandsFocus(null);
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
        <main className={`main space-${view} ${view === 'today' ? 'main-home' : 'main-progressive'}${view === 'decisions' ? ' main-decisions' : ''}${view === 'insights' ? ' main-insights' : ''}${view === 'memory' ? ' main-memory' : ''}${view === 'brands' ? ' main-brands' : ''}${view === 'create' ? ' main-create' : ''}`} role="main">
          <header className={`page-header progressive-header space-header-${view}${view === 'today' ? ' page-header-today' : ''}${view === 'decisions' ? ' page-header-decisions' : ''}${view === 'insights' ? ' page-header-insights' : ''}${view === 'memory' ? ' page-header-memory' : ''}${view === 'brands' ? ' page-header-brands' : ''}${view === 'create' ? ' page-header-create' : ''}`}>
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
                    {!weeklyBoardDismissed && weeklyBoardLoading && (
                      <p className="weekly-board-loading">{t('weeklyBoard.loading')}</p>
                    )}
                    {!weeklyBoardDismissed && !weeklyBoardLoading && weeklyBoard && (
                      <WeeklyBoardCard
                        board={weeklyBoard}
                        onDismiss={() => {
                          dismissWeeklyBoard(weeklyBoard.weekKey);
                          setWeeklyBoardDismissed(true);
                          setWeeklyBoard(null);
                        }}
                      />
                    )}
                    <TodayDraggablePresence onNavigate={setView}>
                      {todayLoading && (
                        <p className="today-action-text today-action-text--loading">{t('today.loading')}</p>
                      )}
                      {!todayLoading && todayError && (
                        <p className="today-action-text today-action-text--error">{todayError}</p>
                      )}
                      {!todayLoading && !todayError && todayExperience && (
                        <TodayExperience
                          today={todayExperience}
                          onOpenDecisions={() => setView('decisions')}
                          variant="desktop"
                        />
                      )}
                    </TodayDraggablePresence>
                    <TodayMobileShell
                      todayLoading={todayLoading}
                      todayError={todayError}
                      today={todayExperience}
                      onNavigate={setView}
                      onOpenDecisions={() => setView('decisions')}
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
                      <>
                        <DecisionResultDisclosure
                          key={`${decisionResult.categoryLabel}-${decisionResult.nextAction}-${decisionResult.confidenceScore}`}
                          result={decisionResult}
                        />
                        <DisclosureTrigger
                          label={t('decisions.newDecision')}
                          onClick={resetDecisionFlow}
                        />
                      </>
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
                  insightCard={insightCard}
                  focus={insightsFocus}
                  patterns={brain.patterns}
                  onFocusChange={setInsightsFocus}
                />
              </div>
            )}

            {view === 'brands' && (
              <div className="create-space brands-space">
                <BrandsStage
                  projectName={projectName}
                  projectRole={brain.projects[projectName as keyof typeof brain.projects].role}
                  focus={brandsFocus}
                  onFocusChange={setBrandsFocus}
                  loading={createLoading}
                  error={createError}
                  potential={potential}
                  selectedProject={selectedProject}
                  onSelectProject={setSelectedProject}
                  onRequestPotential={() => {
                    if (!potential && !createLoading) {
                      void loadCreateBrief(false);
                    }
                  }}
                />
              </div>
            )}

            {view === 'create' && (
              <div className="create-space creative-space">
                <CreateStage />
              </div>
            )}

            {view === 'memory' && (
              <div className="memory-space memory-space--immersive">
                <MemoryManifesto />
              </div>
            )}
          </div>
        </main>

        <footer className="footer">
          <div className="footer-start">
            <DevAiControls todayLoading={todayLoading} onRegenerate={() => void handleRegenerateToday()} />
            <Link href="/about" className="footer-link">
              {t('footer.about')}
            </Link>
          </div>
          <FooterCredit />
        </footer>
      </div>

      <GlobalContentStudio hideTrigger={view === 'memory' || view === 'create'} />
    </div>
  );
}
