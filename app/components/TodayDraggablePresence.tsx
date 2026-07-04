'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { useLanguage } from '../lib/i18n/LanguageContext';
import TodayAvatarNav from './TodayAvatarNav';
import type { AvatarNavView } from './TodayAvatarNav';

const POSITION_STORAGE_KEY = 'giuseppe-today-avatar-position';
const DRAG_THRESHOLD_PX = 8;

type AvatarPosition = {
  x: number;
  y: number;
};

const DEFAULT_POSITION: AvatarPosition = { x: 50, y: 50 };
const EDGE_PAD_PERCENT = 2;

function clampPosition(
  position: AvatarPosition,
  container?: HTMLElement | null,
  presence?: HTMLElement | null
): AvatarPosition {
  if (!container || !presence || container.clientWidth === 0 || container.clientHeight === 0) {
    return {
      x: Math.min(82, Math.max(18, position.x)),
      y: Math.min(68, Math.max(42, position.y))
    };
  }

  const halfWidthPct = ((presence.offsetWidth / 2) / container.clientWidth) * 100;
  const halfHeightPct = ((presence.offsetHeight / 2) / container.clientHeight) * 100;
  const minX = halfWidthPct + EDGE_PAD_PERCENT;
  const maxX = 100 - halfWidthPct - EDGE_PAD_PERCENT;
  const minY = halfHeightPct + EDGE_PAD_PERCENT;
  const maxY = 100 - halfHeightPct - EDGE_PAD_PERCENT;

  return {
    x: Math.min(maxX, Math.max(minX, position.x)),
    y: Math.min(maxY, Math.max(minY, position.y))
  };
}

function readStoredPosition(
  container?: HTMLElement | null,
  presence?: HTMLElement | null
): AvatarPosition {
  if (typeof window === 'undefined') {
    return DEFAULT_POSITION;
  }

  try {
    const raw = window.localStorage.getItem(POSITION_STORAGE_KEY);
    if (!raw) {
      return DEFAULT_POSITION;
    }

    const parsed = JSON.parse(raw) as Partial<AvatarPosition>;
    if (typeof parsed.x !== 'number' || typeof parsed.y !== 'number') {
      return DEFAULT_POSITION;
    }

    return clampPosition({ x: parsed.x, y: parsed.y }, container, presence);
  } catch {
    return DEFAULT_POSITION;
  }
}

function writeStoredPosition(position: AvatarPosition): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(POSITION_STORAGE_KEY, JSON.stringify(position));
}

function resolveTextSide(x: number): 'left' | 'right' {
  return x < 47 ? 'right' : 'left';
}

type TodayDraggablePresenceProps = {
  onNavigate: (view: AvatarNavView) => void;
  children: ReactNode;
};

export function TodayDraggablePresence({ onNavigate, children }: TodayDraggablePresenceProps) {
  const { t } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const presenceRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<AvatarPosition>(DEFAULT_POSITION);
  const positionRef = useRef<AvatarPosition>(DEFAULT_POSITION);
  const [ready, setReady] = useState(false);
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef({
    active: false,
    moved: false,
    pointerId: -1,
    originX: 0,
    originY: 0
  });

  useEffect(() => {
    function applyClampedPosition(next?: AvatarPosition) {
      const container = containerRef.current;
      const presence = presenceRef.current;
      const base = next ?? readStoredPosition(container, presence);
      const clamped = clampPosition(base, container, presence);
      setPosition(clamped);
      positionRef.current = clamped;
      setReady(true);
    }

    applyClampedPosition();
    const frame = window.requestAnimationFrame(() => {
      applyClampedPosition();
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    const presence = presenceRef.current;
    if (!container || !presence) {
      return;
    }

    const observer = new ResizeObserver(() => {
      setPosition(current => {
        const clamped = clampPosition(current, container, presence);
        positionRef.current = clamped;
        return clamped;
      });
    });

    observer.observe(container);
    observer.observe(presence);

    return () => observer.disconnect();
  }, [ready]);

  useEffect(() => {
    function handleResize() {
      const container = containerRef.current;
      const presence = presenceRef.current;
      if (!container || !presence) {
        return;
      }

      setPosition(current => {
        const clamped = clampPosition(current, container, presence);
        positionRef.current = clamped;
        return clamped;
      });
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    positionRef.current = position;
  }, [position]);

  const updatePositionFromPointer = useCallback((clientX: number, clientY: number) => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const rect = container.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    setPosition(
      clampPosition({ x, y }, container, presenceRef.current)
    );
  }, []);

  const handlePointerDown = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) {
      return;
    }

    dragRef.current = {
      active: true,
      moved: false,
      pointerId: event.pointerId,
      originX: event.clientX,
      originY: event.clientY
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }, []);

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!dragRef.current.active || dragRef.current.pointerId !== event.pointerId) {
        return;
      }

      const deltaX = Math.abs(event.clientX - dragRef.current.originX);
      const deltaY = Math.abs(event.clientY - dragRef.current.originY);

      if (!dragRef.current.moved && deltaX < DRAG_THRESHOLD_PX && deltaY < DRAG_THRESHOLD_PX) {
        return;
      }

      dragRef.current.moved = true;
      setDragging(true);
      updatePositionFromPointer(event.clientX, event.clientY);
    },
    [updatePositionFromPointer]
  );

  const finishDrag = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (dragRef.current.pointerId !== event.pointerId) {
      return;
    }

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    if (dragRef.current.moved) {
      writeStoredPosition(positionRef.current);
    }

    dragRef.current = {
      active: false,
      moved: false,
      pointerId: -1,
      originX: 0,
      originY: 0
    };
    setDragging(false);
  }, []);

  const handleDoubleClick = useCallback(() => {
    setPosition(DEFAULT_POSITION);
    writeStoredPosition(DEFAULT_POSITION);
  }, []);

  const textSide = resolveTextSide(position.x);

  return (
    <div className="today-calm today-calm--desktop" ref={containerRef}>
      <div className={`today-action today-action--${textSide}`} data-testid="today-action">
        {children}
      </div>
      <div
        ref={presenceRef}
        className={`today-presence${dragging ? ' today-presence--dragging' : ''}${ready ? ' today-presence--ready' : ''}`}
        style={
          ready
            ? {
                left: `${position.x}%`,
                top: `${position.y}%`
              }
            : undefined
        }
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishDrag}
        onPointerCancel={finishDrag}
        onDoubleClick={handleDoubleClick}
        title={t('today.avatarDragHint')}
        role="presentation"
        aria-hidden={false}
      >
        <TodayAvatarNav onNavigate={onNavigate} />
      </div>
    </div>
  );
}
