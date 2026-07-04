'use client';

import brain from '../../memory/giuseppe_brain.json';
import type { PotentialBrief } from '../../engine/potentialEngine';
import { formatConfidenceDisplay, formatProgressDisplay } from '../lib/formatConfidence';
import { useLanguage } from '../lib/i18n/LanguageContext';

export type CreateFocus = 'why' | 'projects' | 'potential' | null;

type CreateStageProps = {
  projectName: string;
  projectRole: string;
  focus: CreateFocus;
  onFocusChange: (focus: CreateFocus) => void;
  loading: boolean;
  error: string | null;
  potential: PotentialBrief | null;
  selectedProject: string | null;
  onSelectProject: (name: string) => void;
  onRequestPotential: () => void;
};

const FOCUS_ACTIONS = [
  { id: 'why', labelKey: 'why' },
  { id: 'projects', labelKey: 'openProjects' },
  { id: 'potential', labelKey: 'exploreOpportunities' }
] as const;

function PotentialFocusPanel({ potential }: { potential: PotentialBrief }) {
  const { t } = useLanguage();
  const today = potential.todaysOpportunity;

  return (
    <>
      <div className="insights-focus-panel create-potential-lead">
        <div className="kicker">{t('kickers.todaysOpportunity')}</div>
        <h2 className="create-potential-title">{today.title}</h2>
        <p>{today.description}</p>
        <p>
          <b>{t('potential.whyMatters')}:</b> {today.whyThisMatters}
        </p>
        <p>
          <b>{t('potential.firstAction')}:</b> {today.firstAction}
        </p>
        <div className="potential-meta">
          {t('potential.impact')} {today.estimatedImpact} · {today.timeRequired} · {t('potential.energy')}{' '}
          {today.energyRequired}
        </div>
        <div className="potential-score">
          {formatConfidenceDisplay(t, today.confidenceScore, today.confidenceLabel)}
        </div>
        <p>
          {today.hasEnoughData && today.totalScore !== null
            ? `${t('potential.score')} ${Math.round(today.totalScore)} · ${today.sourceProject ?? t('potential.system')}`
            : formatProgressDisplay(t)}
        </p>
      </div>

      <div className="create-potential-grid">
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
          <div className="insights-focus-panel create-potential-item" key={label}>
            <div className="kicker">{label}</div>
            <p>{value}</p>
          </div>
        ))}
      </div>
    </>
  );
}

export function CreateStage({
  projectName,
  projectRole,
  focus,
  onFocusChange,
  loading,
  error,
  potential,
  selectedProject,
  onSelectProject,
  onRequestPotential
}: CreateStageProps) {
  const { t } = useLanguage();

  if (focus !== null) {
    return (
      <div className="insights-focus-stage reading-focus-view" data-testid="create-focus-stage">
        <button type="button" className="reading-expand-close" onClick={() => onFocusChange(null)}>
          <span aria-hidden="true">←</span> {t('disclosure.closeReading')}
        </button>

        {focus === 'why' && (
          <div className="insights-focus-panel">
            <div className="kicker">{t('kickers.strategist')}</div>
            <h2>{t('create.strategistHeadline')}</h2>
            <p>{t('create.strategistSubline')}</p>
          </div>
        )}

        {focus === 'projects' && (
          <>
            <div className="create-projects-list" role="group" aria-label={t('disclosure.openProjects')}>
              {Object.entries(brain.projects).map(([name, project]) => (
                <button
                  key={name}
                  type="button"
                  className={`insights-action-chip${selectedProject === name ? ' insights-action-chip--active' : ''}`}
                  onClick={() => onSelectProject(name)}
                >
                  {name}
                  <span aria-hidden="true">→</span>
                </button>
              ))}
            </div>
            {selectedProject && (
              <div className="insights-focus-panel">
                <div className="kicker">{brain.projects[selectedProject as keyof typeof brain.projects].status.toUpperCase()}</div>
                <h2>{selectedProject}</h2>
                <p>{brain.projects[selectedProject as keyof typeof brain.projects].role}</p>
                <p>
                  {t('disclosure.progress')}: {formatProgressDisplay(t)}
                </p>
              </div>
            )}
          </>
        )}

        {focus === 'potential' && loading && (
          <p className="insights-stage-loading">{t('today.loading')}</p>
        )}

        {focus === 'potential' && error && (
          <p className="insights-stage-error">{error}</p>
        )}

        {focus === 'potential' && potential && !loading && (
          <PotentialFocusPanel potential={potential} />
        )}
      </div>
    );
  }

  return (
    <div className="create-stage" data-testid="create-stage">
      <h1 className="create-stage-title view-title">{t('viewHeadings.create')}</h1>
      <p className="create-stage-headline">{t('create.strategistSubline')}</p>

      <section className="insights-hero-card">
        <div className="kicker">{t('create.focusLabel')}</div>
        <h2 className="insights-hero-text">{projectName}</h2>
        <p className="create-hero-role">{projectRole}</p>
      </section>

      <div className="insights-action-grid" role="group" aria-label={t('nav.create')}>
        {FOCUS_ACTIONS.map(action => (
          <button
            key={action.id}
            type="button"
            className="insights-action-chip"
            onClick={() => {
              if (action.id === 'potential') {
                onRequestPotential();
              }
              onFocusChange(action.id);
            }}
          >
            {t(`disclosure.${action.labelKey}`)}
            <span aria-hidden="true">→</span>
          </button>
        ))}
      </div>

      {loading && <p className="insights-stage-loading">{t('today.loading')}</p>}
      {error && <p className="insights-stage-error">{error}</p>}

      <p className="insights-built-over-time">{t('create.energyNote')}</p>
    </div>
  );
}
