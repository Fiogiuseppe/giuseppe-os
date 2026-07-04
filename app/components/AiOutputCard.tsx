'use client';

import type { ReactNode } from 'react';

type AiOutputCardProps = {
  kicker: string;
  title: string;
  body?: string;
  nextAction?: string;
  nextActionKicker?: string;
  children?: ReactNode;
  testId?: string;
  className?: string;
};

export function AiOutputCard({
  kicker,
  title,
  body,
  nextAction,
  nextActionKicker = 'NEXT ACTION',
  children,
  testId,
  className
}: AiOutputCardProps) {
  return (
    <article
      className={`card ai-output-card${className ? ` ${className}` : ''}`}
      data-testid={testId}
    >
      <div className="kicker">{kicker}</div>
      <h3 className="ai-output-card-title">{title}</h3>
      {body ? <p className="ai-output-card-body">{body}</p> : null}
      {nextAction ? (
        <>
          <div className="kicker ai-output-card-next-kicker">{nextActionKicker}</div>
          <p className="ai-output-card-next">{nextAction}</p>
        </>
      ) : null}
      {children}
    </article>
  );
}
