'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './LivingAvatar.module.css';

const EYES_OPEN = '/avatar/avatar-eyes-open.png';
const EYES_CLOSED = '/avatar/avatar-eyes-closed.png';

const BLINK_MIN_MS = 2200;
const BLINK_MAX_MS = 4500;
const BLINK_DURATION_MS = 280;
const FIRST_BLINK_MS = 1200;

const PARALLAX_X = 9;
const PARALLAX_Y = 7;
const PARALLAX_ROTATE = 0.65;

function randomBlinkDelay(): number {
  return BLINK_MIN_MS + Math.random() * (BLINK_MAX_MS - BLINK_MIN_MS);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export default function LivingAvatar() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [eyesClosed, setEyesClosed] = useState(false);

  useEffect(() => {
    [EYES_OPEN, EYES_CLOSED].forEach(src => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  useEffect(() => {
    let blinkTimer: number | undefined;
    let openTimer: number | undefined;

    const blink = () => {
      setEyesClosed(true);
      openTimer = window.setTimeout(() => {
        setEyesClosed(false);
        blinkTimer = window.setTimeout(blink, randomBlinkDelay());
      }, BLINK_DURATION_MS);
    };

    blinkTimer = window.setTimeout(blink, FIRST_BLINK_MS);

    return () => {
      if (blinkTimer !== undefined) {
        window.clearTimeout(blinkTimer);
      }
      if (openTimer !== undefined) {
        window.clearTimeout(openTimer);
      }
    };
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) {
      return;
    }

    const updateParallax = (clientX: number, clientY: number) => {
      const rect = root.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const normX = clamp((clientX - centerX) / (rect.width / 2), -1, 1);
      const normY = clamp((clientY - centerY) / (rect.height / 2), -1, 1);

      root.style.setProperty('--parallax-x', `${normX * PARALLAX_X}px`);
      root.style.setProperty('--parallax-y', `${normY * PARALLAX_Y}px`);
      root.style.setProperty('--parallax-rotate', `${normX * PARALLAX_ROTATE}deg`);
    };

    const onPointerMove = (event: PointerEvent) => {
      updateParallax(event.clientX, event.clientY);
    };

    const onPointerLeave = () => {
      root.style.setProperty('--parallax-x', '0px');
      root.style.setProperty('--parallax-y', '0px');
      root.style.setProperty('--parallax-rotate', '0deg');
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerleave', onPointerLeave);

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerleave', onPointerLeave);
    };
  }, []);

  return (
    <div ref={rootRef} className={styles.root} aria-hidden="true">
      <div className={styles.parallax}>
        <div className={styles.idle}>
          <div className={styles.breath}>
            <div className={styles.portraitStack}>
              <img
                src={EYES_OPEN}
                alt=""
                className={`${styles.portraitLayer} ${styles.portraitOpen}`}
                width={1024}
                height={1024}
                draggable={false}
              />
              <img
                src={EYES_CLOSED}
                alt=""
                className={`${styles.portraitLayer} ${styles.portraitClosed}${eyesClosed ? ` ${styles.portraitClosedVisible}` : ''}`}
                width={1024}
                height={1024}
                draggable={false}
                aria-hidden="true"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
