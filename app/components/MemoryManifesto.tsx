'use client';

import { useState } from 'react';
import brain from '../../memory/giuseppe_brain.json';
import {
  buildManifestoDepthSections,
  buildManifestoPrimarySections,
  type ManifestoSection
} from '../lib/memoryManifestoSections';
import { useLanguage } from '../lib/i18n/LanguageContext';

function ManifestoArticle({ section }: { section: ManifestoSection }) {
  return (
    <article className="manifesto-article" aria-labelledby={`manifesto-${section.id}`}>
      <h2
        id={`manifesto-${section.id}`}
        className={`manifesto-article-label${section.accent ? ' manifesto-article-label--accent' : ''}`}
      >
        {section.label}
      </h2>
      <div className="manifesto-article-body">
        {section.lines.map(line => (
          <p key={line} className="manifesto-line">
            {line}
          </p>
        ))}
      </div>
    </article>
  );
}

export function MemoryManifesto() {
  const { t } = useLanguage();
  const [depthOpen, setDepthOpen] = useState(false);

  const primarySections = buildManifestoPrimarySections(brain);
  const depthSections = buildManifestoDepthSections(brain);

  if (depthOpen) {
    return (
      <article className="memory-manifesto memory-manifesto--depth" data-testid="memory-manifesto-depth">
        <header className="manifesto-header">
          <p className="manifesto-epigraph">{t('navRole.memory')}</p>
          <h1 className="manifesto-title view-title">{t('memory.depthTitle')}</h1>
        </header>

        <div className="manifesto-articles manifesto-articles--depth" role="list">
          {depthSections.map(section => (
            <ManifestoArticle key={section.id} section={section} />
          ))}
        </div>

        <button
          type="button"
          className="manifesto-continue manifesto-continue--close"
          onClick={() => setDepthOpen(false)}
        >
          <span aria-hidden="true">←</span> {t('disclosure.closeReading')}
        </button>
      </article>
    );
  }

  return (
    <article className="memory-manifesto" data-testid="memory-manifesto">
      <header className="manifesto-header">
        <p className="manifesto-epigraph">{t('navRole.memory')}</p>
        <h1 className="manifesto-title view-title">{t('viewHeadings.memory')}</h1>
      </header>

      <section className="manifesto-preamble" aria-label={t('kickers.northStar')}>
        <p className="manifesto-preamble-text">{brain.manifesto}</p>
      </section>

      <div className="manifesto-articles" role="list">
        {primarySections.map(section => (
          <ManifestoArticle key={section.id} section={section} />
        ))}
      </div>

      <button
        type="button"
        className="manifesto-continue"
        onClick={() => setDepthOpen(true)}
      >
        {t('disclosure.exploreMemory')}
      </button>
    </article>
  );
}
