'use client';

import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../lib/i18n/LanguageContext';

const SPEED_LINE_COUNT = 48;

function buildSpeedLines(): string[] {
  const lines: string[] = [];
  for (let index = 0; index < SPEED_LINE_COUNT; index += 1) {
    const angle = (index / SPEED_LINE_COUNT) * Math.PI * 2;
    const x2 = 50 + Math.cos(angle) * 95;
    const y2 = 50 + Math.sin(angle) * 95;
    lines.push(`M50 50 L${x2.toFixed(2)} ${y2.toFixed(2)}`);
  }
  return lines;
}

const SPEED_LINES = buildSpeedLines();

export function MemoryTunnelBackground() {
  const { t } = useLanguage();
  const rootRef = useRef<HTMLDivElement>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReducedMotion(media.matches);
    sync();
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    if (reducedMotion) {
      return;
    }

    const root = rootRef.current;
    if (!root) {
      return;
    }

    function handlePointerMove(event: PointerEvent) {
      const rect = root!.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
      root!.style.setProperty('--tunnel-x', `${x * 14}px`);
      root!.style.setProperty('--tunnel-y', `${y * 10}px`);
      root!.style.setProperty('--tunnel-rotate', `${x * 2.5}deg`);
    }

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    return () => window.removeEventListener('pointermove', handlePointerMove);
  }, [reducedMotion]);

  return (
    <div
      ref={rootRef}
      className={`memory-tunnel${reducedMotion ? ' memory-tunnel--static' : ''}`}
      aria-hidden="true"
      data-testid="memory-tunnel"
    >
      <div className="memory-tunnel-perspective">
        <svg
          className="memory-tunnel-wall-svg memory-tunnel-wall-svg--left"
          viewBox="0 0 320 96"
          preserveAspectRatio="xMaxYMid meet"
          aria-hidden="true"
        >
          <text x="312" y="62" className="memory-tunnel-word">
            {t('memory.tunnelLeft')}
          </text>
        </svg>
        <svg
          className="memory-tunnel-wall-svg memory-tunnel-wall-svg--right"
          viewBox="0 0 420 96"
          preserveAspectRatio="xMinYMid meet"
          aria-hidden="true"
        >
          <text x="8" y="62" className="memory-tunnel-word">
            {t('memory.tunnelRight')}
          </text>
        </svg>
      </div>

      <svg className="memory-tunnel-lines" viewBox="0 0 100 100" preserveAspectRatio="none">
        {SPEED_LINES.map((path, index) => (
          <path
            key={path}
            d={path}
            className="memory-tunnel-line"
            style={{ animationDelay: `${(index % 12) * 0.08}s` }}
          />
        ))}
      </svg>

      <div className="memory-tunnel-vanish">
        <span className="memory-tunnel-core" />
      </div>

      <div className="memory-tunnel-grain" />
    </div>
  );
}
