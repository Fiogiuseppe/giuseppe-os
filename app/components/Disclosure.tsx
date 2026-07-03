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
      {label}
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
    <div className={`accordion-domain ${open ? 'open' : ''}`}>
      <button type="button" className="accordion-domain-trigger" onClick={() => setOpen(value => !value)}>
        <div>
          <div className="kicker">{kicker}</div>
          <h3>{title}</h3>
        </div>
        <span className="accordion-chevron">{open ? '−' : '+'}</span>
      </button>
      <DisclosurePanel open={open}>
        <div className="accordion-domain-body">{children}</div>
      </DisclosurePanel>
    </div>
  );
}
