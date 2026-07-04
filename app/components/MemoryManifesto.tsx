'use client';

import { useEffect, useRef } from 'react';
import { useLanguage } from '../lib/i18n/LanguageContext';

const HOW_KEYS = ['memory.how1', 'memory.how2', 'memory.how3', 'memory.how4'] as const;

function useConstitutionParallax<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) {
      return undefined;
    }

    const onMove = (event: MouseEvent) => {
      const rect = root.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      root.style.setProperty('--memory-parallax-x', `${x * 8}px`);
      root.style.setProperty('--memory-parallax-y', `${y * 5}px`);
    };

    root.addEventListener('mousemove', onMove);
    return () => root.removeEventListener('mousemove', onMove);
  }, []);

  return ref;
}

export function MemoryManifesto() {
  const { t } = useLanguage();
  const constitutionRef = useConstitutionParallax<HTMLElement>();
  const principles = HOW_KEYS.map(key => t(key));

  return (
    <article
      ref={constitutionRef}
      className="memory-constitution"
      data-testid="memory-constitution"
    >
      <p className="memory-constitution-epigraph">{t('memory.epigraph')}</p>

      <section className="memory-constitution-section memory-constitution-section--why" aria-labelledby="memory-why-label">
        <h2 id="memory-why-label" className="memory-constitution-label">
          {t('memory.whyLabel')}
        </h2>
        <p className="memory-constitution-why">{t('memory.whyText')}</p>
      </section>

      <section className="memory-constitution-section memory-constitution-section--how" aria-labelledby="memory-how-label">
        <h2 id="memory-how-label" className="memory-constitution-label">
          {t('memory.howLabel')}
        </h2>
        <ol className="memory-constitution-principles">
          {principles.map((principle, index) => (
            <li
              key={principle}
              className="memory-constitution-principle"
              style={{ animationDelay: `${0.35 + index * 0.18}s` }}
            >
              {principle}
            </li>
          ))}
        </ol>
      </section>
    </article>
  );
}
