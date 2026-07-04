'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { useLanguage } from '../lib/i18n/LanguageContext';
import TodayAvatarNav from './TodayAvatarNav';
import type { AvatarNavView } from './TodayAvatarNav';

const POSITION_STORAGE_KEY = 'giuseppe-today-avatar-position';
const DRAG_THRESHOLD_PX = 8;
const PORTRAIT_VISUAL_SCALE = 1.24;
const BREATH_CLEARANCE_PX = 10;
const EDGE_PAD_PERCENT = 3;

type AvatarPosition = {
  x: number;
  y: number;
};

const DEFAULT_POSITION: AvatarPosition = { x: 50, y: 50 };

type DragBounds = {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
};

function getDragBounds(
  container?: HTMLElement | null,
  presence?: HTMLElement | null
): DragBounds | null {
  if (!container || !presence || container.clientWidth === 0 || container.clientHeight === 0) {
    return null;
  }

  const halfWidthPct =
    (((presence.offsetWidth / 2) * PORTRAIT_VISUAL_SCALE) / container.clientWidth) * 100;
  const halfHeightPct =
    (((presence.offsetHeight / 2) * PORTRAIT_VISUAL_SCALE + BREATH_CLEARANCE_PX) /
      container.clientHeight) *
    100;

  return {
    minX: halfWidthPct + EDGE_PAD_PERCENT,
    maxX: 100 - halfWidthPct - EDGE_PAD_PERCENT,
    minY: halfHeightPct + EDGE_PAD_PERCENT,
    maxY: 100 - halfHeightPct - EDGE_PAD_PERCENT
  };
}

function clampPosition(
  position: AvatarPosition,
  container?: HTMLElement | null,
  presence?: HTMLElement | null
): AvatarPosition {
  const bounds = getDragBounds(container, presence);
  if (!bounds) {
    return {
      x: Math.min(80, Math.max(20, position.x)),
      y: Math.min(66, Math.max(46, position.y))
    };
  }

  return {
    x: Math.min(bounds.maxX, Math.max(bounds.minX, position.x)),
    y: Math.min(bounds.maxY, Math.max(bounds.minY, position.y))
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

function isAvatarZoneTarget(target: EventTarget | null): boolean {
  return target instanceof Element && Boolean(target.closest('[data-testid="today-avatar-nav"] button'));
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
  const [textSide, setTextSide] = useState<'left' | 'right'>(resolveTextSide(DEFAULT_POSITION.x));
  const [ready, setReady] = useState(false);
  const [dragging, setDragging] = useState(false);
  const textSideFrameRef = useRef<number | null>(null);
  const dragRef = useRef({
    active: false,
    moved: false,
    pointerId: -1,
    originX: 0,
    originY: 0
  });
  const windowListenersRef = useRef<{
    move: (event: PointerEvent) => void;
    up: (event: PointerEvent) => void;
  } | null>(null);

  const applyPositionToDom = useCallback((next: AvatarPosition) => {
    const presence = presenceRef.current;
    if (!presence) {
      return;
    }

    presence.style.left = `${next.x}%`;
    presence.style.top = `${next.y}%`;
    positionRef.current = next;
  }, []);

  const scheduleTextSideUpdate = useCallback((x: number) => {
    if (textSideFrameRef.current !== null) {
      return;
    }

    textSideFrameRef.current = window.requestAnimationFrame(() => {
      textSideFrameRef.current = null;
      setTextSide(resolveTextSide(x));
    });
  }, []);

  const syncPosition = useCallback(
    (next: AvatarPosition, options?: { persist?: boolean; updateTextSide?: boolean }) => {
      const container = containerRef.current;
      const presence = presenceRef.current;
      const clamped = clampPosition(next, container, presence);
      applyPositionToDom(clamped);
      setPosition(clamped);

      if (options?.updateTextSide !== false) {
        setTextSide(resolveTextSide(clamped.x));
      }

      if (options?.persist) {
        writeStoredPosition(clamped);
      }
    },
    [applyPositionToDom]
  );

  const clearWindowListeners = useCallback(() => {
    const listeners = windowListenersRef.current;
    if (!listeners) {
      return;
    }

    window.removeEventListener('pointermove', listeners.move);
    window.removeEventListener('pointerup', listeners.up);
    window.removeEventListener('pointercancel', listeners.up);
    windowListenersRef.current = null;
  }, []);

  useEffect(() => {
    function applyInitialPosition() {
      const container = containerRef.current;
      const presence = presenceRef.current;
      const clamped = clampPosition(readStoredPosition(container, presence), container, presence);
      applyPositionToDom(clamped);
      setPosition(clamped);
      setTextSide(resolveTextSide(clamped.x));
      setReady(true);
    }

    applyInitialPosition();
    const frame = window.requestAnimationFrame(applyInitialPosition);

    return () => {
      window.cancelAnimationFrame(frame);
      if (textSideFrameRef.current !== null) {
        window.cancelAnimationFrame(textSideFrameRef.current);
      }
      clearWindowListeners();
    };
  }, [applyPositionToDom, clearWindowListeners]);

  useEffect(() => {
    const container = containerRef.current;
    const presence = presenceRef.current;
    if (!ready || !container || !presence) {
      return;
    }

    const observer = new ResizeObserver(() => {
      if (dragRef.current.active) {
        return;
      }

      syncPosition(positionRef.current);
    });

    observer.observe(container);
    observer.observe(presence);

    return () => observer.disconnect();
  }, [ready, syncPosition]);

  const updatePositionFromPointer = useCallback(
    (clientX: number, clientY: number, options?: { liveTextSide?: boolean }) => {
      const container = containerRef.current;
      const presence = presenceRef.current;
      if (!container) {
        return;
      }

      const rect = container.getBoundingClientRect();
      const x = ((clientX - rect.left) / rect.width) * 100;
      const y = ((clientY - rect.top) / rect.height) * 100;
      const clamped = clampPosition({ x, y }, container, presence);
      applyPositionToDom(clamped);

      if (options?.liveTextSide) {
        scheduleTextSideUpdate(clamped.x);
      }
    },
    [applyPositionToDom, scheduleTextSideUpdate]
  );

  const finishDrag = useCallback(
    (pointerId: number) => {
      clearWindowListeners();

      if (dragRef.current.moved) {
        syncPosition(positionRef.current, { persist: true });
      }

      dragRef.current = {
        active: false,
        moved: false,
        pointerId: -1,
        originX: 0,
        originY: 0
      };
      setDragging(false);
    },
    [clearWindowListeners, syncPosition]
  );

  const handlePointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (event.button !== 0 || isAvatarZoneTarget(event.target)) {
        return;
      }

      dragRef.current = {
        active: true,
        moved: false,
        pointerId: event.pointerId,
        originX: event.clientX,
        originY: event.clientY
      };

      const onWindowPointerMove = (moveEvent: PointerEvent) => {
        if (!dragRef.current.active || moveEvent.pointerId !== dragRef.current.pointerId) {
          return;
        }

        const deltaX = Math.abs(moveEvent.clientX - dragRef.current.originX);
        const deltaY = Math.abs(moveEvent.clientY - dragRef.current.originY);

        if (!dragRef.current.moved) {
          if (deltaX < DRAG_THRESHOLD_PX && deltaY < DRAG_THRESHOLD_PX) {
            return;
          }

          dragRef.current.moved = true;
          setDragging(true);
        }

        updatePositionFromPointer(moveEvent.clientX, moveEvent.clientY, { liveTextSide: true });
      };

      const onWindowPointerUp = (upEvent: PointerEvent) => {
        if (upEvent.pointerId !== dragRef.current.pointerId) {
          return;
        }

        finishDrag(upEvent.pointerId);
      };

      windowListenersRef.current = {
        move: onWindowPointerMove,
        up: onWindowPointerUp
      };

      window.addEventListener('pointermove', onWindowPointerMove);
      window.addEventListener('pointerup', onWindowPointerUp);
      window.addEventListener('pointercancel', onWindowPointerUp);
    },
    [finishDrag, updatePositionFromPointer]
  );

  const handleDoubleClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (isAvatarZoneTarget(event.target)) {
        return;
      }

      syncPosition(DEFAULT_POSITION, { persist: true });
    },
    [syncPosition]
  );

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
