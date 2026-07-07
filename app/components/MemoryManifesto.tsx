'use client';

import { useEffect, useRef } from 'react';
import { useLanguage } from '../lib/i18n/LanguageContext';
import { MemoryTunnelBackground } from './MemoryTunnelBackground';
import { MemorySuggestionClouds } from './MemorySuggestionClouds';

const HOW_SLOTS = [
  { key: 'memory.how1', slot: '1' },
  { key: 'memory.how2', slot: '2' },
  { key: 'memory.how3', slot: '3' },
  { key: 'memory.how4', slot: '4' }
] as const;

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
      root.style.setProperty('--memory-parallax-x', `${x * 6}px`);
      root.style.setProperty('--memory-parallax-y', `${y * 4}px`);
    };

    root.addEventListener('mousemove', onMove);
    return () => root.removeEventListener('mousemove', onMove);
  }, []);

  return ref;
}

export function MemoryManifesto() {
  const { t } = useLanguage();
  const constitutionRef = useConstitutionParallax<HTMLElement>();

  return (
    <>
      <MemoryTunnelBackground />
      <MemorySuggestionClouds />
      <article
        ref={constitutionRef}
        className="memory-constitution memory-constitution--tunnel"
        data-testid="memory-constitution"
      >
      <section className="memory-why-row" aria-labelledby="memory-why-label">
        <h2 id="memory-why-label" className="memory-constitution-tag memory-constitution-tag--why">
          {t('memory.whyLabel')}
        </h2>
        <p className="memory-constitution-why">{t('memory.whyText')}</p>
      </section>

      <section className="memory-how-row" aria-labelledby="memory-how-label">
        <h2 id="memory-how-label" className="memory-constitution-tag memory-constitution-tag--how">
          {t('memory.howLabel')}
        </h2>
        <ol className="memory-constitution-grid">
          {HOW_SLOTS.map(({ key, slot }, index) => (
            <li
              key={key}
              className={`memory-constitution-principle memory-constitution-principle--${slot}`}
              style={{ animationDelay: `${0.25 + index * 0.14}s` }}
            >
              {t(key)}
            </li>
          ))}
        </ol>
      </section>
    </article>
    </>
  );
}
