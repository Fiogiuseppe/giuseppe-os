'use client';

import { useState, type ReactNode } from 'react';

export function DisclosureTrigger({
  label,
  onClick,
  className = 'disclosure-trigger'
}: {
  label: string;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button type="button" className={className} onClick={onClick}>
      <span className="disclosure-trigger-label">{label}</span>
      <span className="disclosure-trigger-arrow" aria-hidden="true">→</span>
    </button>
  );
}

export function DisclosurePanel({
  open,
  children,
  className = 'disclosure-panel'
}: {
  open: boolean;
  children: ReactNode;
  className?: string;
}) {
  if (!open) return null;
  return <div className={className}>{children}</div>;
}

export function StatusPill({
  label,
  value,
  onClick
}: {
  label: string;
  value: string;
  onClick?: () => void;
}) {
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag type={onClick ? 'button' : undefined} className="status-indicator" onClick={onClick}>
      <span className="status-indicator-label">{label}</span>
      <span className="status-indicator-value">{value}</span>
    </Tag>
  );
}

export function AccordionDomain({
  title,
  kicker,
  children,
  defaultOpen = false
}: {
  title: string;
  kicker: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={`accordion-domain memory-shelf ${open ? 'open' : ''}`}>
      <button
        type="button"
        className="accordion-domain-trigger"
        onClick={() => setOpen(value => !value)}
        aria-expanded={open}
      >
        <div>
          <div className="kicker">{kicker}</div>
          <h3>{title}</h3>
        </div>
        <span className="accordion-chevron">{open ? '−' : '+'}</span>
      </button>
      {open ? (
        <div className="accordion-collapse open">
          <div className="accordion-domain-body">{children}</div>
        </div>
      ) : null}
    </div>
  );
}

export function RitualStep({
  step,
  label,
  children,
  isLast = false
}: {
  step: number;
  label: string;
  children: ReactNode;
  isLast?: boolean;
}) {
  return (
    <div className={`ritual-step ${isLast ? 'ritual-step-last' : ''}`}>
      <div className="ritual-rail">
        <span className="ritual-number">{step}</span>
        {!isLast && <span className="ritual-line" />}
      </div>
      <div className="ritual-content">
        <div className="kicker">{label}</div>
        {children}
      </div>
    </div>
  );
}
