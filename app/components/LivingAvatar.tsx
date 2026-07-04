'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './LivingAvatar.module.css';

const BASE_FACE = '/avatar/avatar-eyes-open.png';

const BLINK_FRAMES = [
  '/avatar/avatar-eyes-mid.png',
  '/avatar/avatar-eyes-mid2.png',
  '/avatar/avatar-eyes-closed.png',
] as const;

const BLINK_SEQUENCE = [
  { frame: 0, duration: 42 },
  { frame: 1, duration: 48 },
  { frame: 2, duration: 72 },
  { frame: 1, duration: 48 },
  { frame: 0, duration: 42 },
] as const;

const BLINK_MIN_MS = 2200;
const BLINK_MAX_MS = 4500;
const FIRST_BLINK_MS = 1200;

const PARALLAX_X = 9;
const PARALLAX_Y = 7;
const PARALLAX_ROTATE = 0.65;

const ALL_ASSETS = [BASE_FACE, ...BLINK_FRAMES];

function randomBlinkDelay(): number {
  return BLINK_MIN_MS + Math.random() * (BLINK_MAX_MS - BLINK_MIN_MS);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function runBlinkSequence(
  setBlinkFrame: (frame: number | null) => void,
  timers: number[],
  onComplete: () => void,
): void {
  let step = 0;

  const advance = () => {
    if (step >= BLINK_SEQUENCE.length) {
      setBlinkFrame(null);
      onComplete();
      return;
    }

    const { frame, duration } = BLINK_SEQUENCE[step];
    setBlinkFrame(frame);
    step += 1;

    const timer = window.setTimeout(advance, duration);
    timers.push(timer);
  };

  advance();
}

export default function LivingAvatar() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [blinkFrame, setBlinkFrame] = useState<number | null>(null);

  useEffect(() => {
    ALL_ASSETS.forEach(src => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  useEffect(() => {
    const timers: number[] = [];
    let cancelled = false;

    const scheduleBlink = () => {
      if (cancelled) {
        return;
      }

      runBlinkSequence(setBlinkFrame, timers, () => {
        if (cancelled) {
          return;
        }

        const timer = window.setTimeout(scheduleBlink, randomBlinkDelay());
        timers.push(timer);
      });
    };

    const firstTimer = window.setTimeout(scheduleBlink, FIRST_BLINK_MS);
    timers.push(firstTimer);

    return () => {
      cancelled = true;
      timers.forEach(timer => window.clearTimeout(timer));
      setBlinkFrame(null);
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
                src={BASE_FACE}
                alt=""
                className={`${styles.portraitLayer} ${styles.portraitBase}`}
                width={1024}
                height={1024}
                draggable={false}
              />
              {blinkFrame !== null ? (
                <div className={styles.eyeClip}>
                  <img
                    src={BLINK_FRAMES[blinkFrame]}
                    alt=""
                    className={`${styles.portraitLayer} ${styles.eyeFrame}`}
                    width={1024}
                    height={1024}
                    draggable={false}
                    aria-hidden="true"
                  />
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
