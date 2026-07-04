'use client';

import { useEffect, useState } from 'react';
import brain from '../../memory/giuseppe_brain.json';
import type { PotentialBrief } from '../../engine/potentialEngine';
import {
  CREATE_FEATURED_PROJECTS,
  getProjectVisual,
  type ProjectVisual
} from '../lib/createProjectVisuals';
import { formatConfidenceDisplay, formatProgressDisplay } from '../lib/formatConfidence';
import { useLanguage } from '../lib/i18n/LanguageContext';
import { ContentGeneratorPanel } from './ContentGeneratorPanel';

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

function ProjectVisualMark({
  visual,
  className = ''
}: {
  visual: ProjectVisual;
  className?: string;
}) {
  return (
    <img
      src={visual.src}
      alt={visual.alt}
      className={`create-project-mark${visual.variant ? ` create-project-mark--${visual.variant}` : ''}${className ? ` ${className}` : ''}`}
      draggable={false}
    />
  );
}

function ProjectVisualTile({
  name,
  status,
  selected,
  onSelect
}: {
  name: string;
  status: string;
  selected?: boolean;
  onSelect: () => void;
}) {
  const visual = getProjectVisual(name);

  return (
    <button
      type="button"
      className={`create-project-tile${selected ? ' create-project-tile--active' : ''}`}
      onClick={onSelect}
      aria-pressed={selected}
      aria-label={name}
    >
      <div className="create-project-tile-visual">
        <ProjectVisualMark visual={visual} />
      </div>
      <div className="create-project-tile-copy">
        <span className="create-project-tile-name">{name}</span>
        <span className="create-project-tile-status">{status}</span>
      </div>
    </button>
  );
}

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
  const [heroProject, setHeroProject] = useState(projectName);

  useEffect(() => {
    setHeroProject(projectName);
  }, [projectName]);

  const heroVisual = getProjectVisual(heroProject);
  const heroRole =
    brain.projects[heroProject as keyof typeof brain.projects]?.role ?? projectRole;
  const heroStatus =
    brain.projects[heroProject as keyof typeof brain.projects]?.status.toUpperCase() ?? 'ACTIVE';

  function selectProject(name: string) {
    setHeroProject(name);
    onSelectProject(name);
  }

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
            <div className="create-project-grid" role="group" aria-label={t('disclosure.openProjects')}>
              {Object.entries(brain.projects).map(([name, project]) => (
                <ProjectVisualTile
                  key={name}
                  name={name}
                  status={project.status}
                  selected={selectedProject === name}
                  onSelect={() => selectProject(name)}
                />
              ))}
            </div>
            {selectedProject && (
              <div className="insights-focus-panel create-project-detail">
                <div className="create-project-detail-visual">
                  <ProjectVisualMark visual={getProjectVisual(selectedProject)} />
                </div>
                <div className="create-project-detail-copy">
                  <div className="kicker">
                    {brain.projects[selectedProject as keyof typeof brain.projects].status.toUpperCase()}
                  </div>
                  <h2>{selectedProject}</h2>
                  <p>{brain.projects[selectedProject as keyof typeof brain.projects].role}</p>
                  <p>
                    {t('disclosure.progress')}: {formatProgressDisplay(t)}
                  </p>
                </div>
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

      <section className="create-hero-card">
        <div className="create-hero-visual">
          <ProjectVisualMark visual={heroVisual} className="create-hero-mark" />
        </div>
        <div className="create-hero-copy">
          <div className="kicker">{t('create.focusLabel')}</div>
          <h2 className="create-hero-title">{heroProject}</h2>
          <p className="create-hero-status">{heroStatus}</p>
          <p className="create-hero-role">{heroRole}</p>
        </div>
      </section>

      <div className="create-ecosystem" role="list" aria-label={t('create.ecosystemLabel')}>
        {CREATE_FEATURED_PROJECTS.map(name => {
          const project = brain.projects[name as keyof typeof brain.projects];
          if (!project) {
            return null;
          }

          return (
            <ProjectVisualTile
              key={name}
              name={name}
              status={project.status}
              selected={heroProject === name}
              onSelect={() => selectProject(name)}
            />
          );
        })}
      </div>

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

      <ContentGeneratorPanel sourceType="freeform" />
    </div>
  );
}
