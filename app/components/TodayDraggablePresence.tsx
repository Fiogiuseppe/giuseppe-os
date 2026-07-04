'use client';

import type { ReactNode } from 'react';
import TodayAvatarNav from './TodayAvatarNav';
import type { AvatarNavView } from './TodayAvatarNav';

type TodayDraggablePresenceProps = {
  onNavigate: (view: AvatarNavView) => void;
  children: ReactNode;
};

export function TodayDraggablePresence({ onNavigate, children }: TodayDraggablePresenceProps) {
  return (
    <div className="today-calm today-calm--desktop">
      <div className="today-action today-action--left" data-testid="today-action">
        {children}
      </div>
      <div className="today-presence">
        <TodayAvatarNav onNavigate={onNavigate} />
      </div>
    </div>
  );
}
