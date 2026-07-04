'use client';

import { useState } from 'react';
import brain from '../../memory/giuseppe_brain.json';
import {
  buildManifestoDepthSections,
  buildManifestoPrimarySections,
  type ManifestoSection
} from '../lib/memoryManifestoSections';
import { useLanguage } from '../lib/i18n/LanguageContext';
import { MemoryTunnelBackground } from './MemoryTunnelBackground';

function sectionTeaser(section: ManifestoSection): string {
  const first = section.lines[0] ?? '';
  if (first.length <= 72) {
    return first;
  }
  return `${first.slice(0, 69)}…`;
}

function MemoryNode({
  section,
  onSelect
}: {
  section: ManifestoSection;
  onSelect: (section: ManifestoSection) => void;
}) {
  return (
    <button
      type="button"
      className={`memory-node${section.accent ? ' memory-node--accent' : ''}`}
      onClick={() => onSelect(section)}
      aria-labelledby={`manifesto-${section.id}`}
    >
      <h2
        id={`manifesto-${section.id}`}
        className={`memory-node-label${section.accent ? ' memory-node-label--accent' : ''}`}
      >
        {section.label}
      </h2>
      <p className="memory-node-teaser">{sectionTeaser(section)}</p>
    </button>
  );
}

function MemoryFocusPanel({
  section,
  onClose
}: {
  section: ManifestoSection;
  onClose: () => void;
}) {
  const { t } = useLanguage();

  return (
    <div className="insights-focus-stage reading-focus-view memory-focus-stage" data-testid="memory-focus-stage">
      <button type="button" className="reading-expand-close" onClick={onClose}>
        <span aria-hidden="true">←</span> {t('disclosure.closeReading')}
      </button>

      <div className={`insights-focus-panel memory-focus-panel${section.accent ? ' memory-focus-panel--accent' : ''}`}>
        <div className="kicker">{section.label}</div>
        <div className="memory-focus-body">
          {section.lines.map(line => (
            <p key={line} className="memory-focus-line">
              {line}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}

export function MemoryManifesto() {
  const { t } = useLanguage();
  const [layer, setLayer] = useState<'surface' | 'depth'>('surface');
  const [activeSection, setActiveSection] = useState<ManifestoSection | null>(null);

  const primarySections = buildManifestoPrimarySections(brain);
  const depthSections = buildManifestoDepthSections(brain);
  const northStar = primarySections.find(section => section.id === 'north-star');
  const orbitSections = primarySections.filter(section => section.id !== 'north-star');

  if (activeSection) {
    return <MemoryFocusPanel section={activeSection} onClose={() => setActiveSection(null)} />;
  }

  if (layer === 'depth') {
    return (
      <article className="memory-stage memory-stage--depth" data-testid="memory-manifesto-depth">
        <header className="memory-stage-intro">
          <p className="memory-stage-epigraph">{t('navRole.memory')}</p>
          <h1 className="memory-stage-title view-title">{t('memory.depthTitle')}</h1>
        </header>

        <div className="memory-constellation memory-constellation--depth" role="list">
          {depthSections.map(section => (
            <MemoryNode key={section.id} section={section} onSelect={setActiveSection} />
          ))}
        </div>

        <button
          type="button"
          className="insights-action-chip memory-layer-back"
          onClick={() => setLayer('surface')}
        >
          <span aria-hidden="true">←</span> {t('memory.backToManifesto')}
        </button>
      </article>
    );
  }

  return (
    <>
      <MemoryTunnelBackground />
      <article className="memory-stage memory-stage--tunnel" data-testid="memory-manifesto">
        <div className="memory-tunnel-content">
          <header className="memory-stage-intro">
            <p className="memory-stage-epigraph">{t('navRole.memory')}</p>
            <h1 className="memory-stage-title view-title">{t('viewHeadings.memory')}</h1>
            <p className="memory-stage-headline">{brain.manifesto}</p>
          </header>

          {northStar && (
            <section className="memory-hero-card" aria-labelledby="manifesto-north-star">
              <h2 id="manifesto-north-star" className="kicker memory-hero-kicker">
                {northStar.label}
              </h2>
              <p className="memory-hero-text">{northStar.lines[0]}</p>
            </section>
          )}

          <div className="memory-constellation" role="list">
            {orbitSections.map(section => (
              <MemoryNode key={section.id} section={section} onSelect={setActiveSection} />
            ))}
          </div>

          <button type="button" className="insights-action-chip" onClick={() => setLayer('depth')}>
            {t('disclosure.exploreMemory')}
            <span aria-hidden="true">→</span>
          </button>

          <p className="insights-built-over-time">{t('memory.constitutionNote')}</p>
        </div>
      </article>
    </>
  );
}
