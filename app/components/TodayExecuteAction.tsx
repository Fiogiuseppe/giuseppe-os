'use client';

import { useMemo, useState } from 'react';
import type { ContentFormat } from '../../lib/content/types';
import type { TodayActionKind } from '../../lib/today-action/types';
import { resolveTodayAction } from '../../lib/today-action/infer';
import { useLanguage } from '../lib/i18n/LanguageContext';

type TodayExecuteActionProps = {
  oneBigMove: string;
  actionKind?: TodayActionKind;
  actionTopic?: string;
  onOpenDecisions?: () => void;
  className?: string;
};

type GeneratedResult = {
  format: ContentFormat;
  content: string;
};

function formatForKind(kind: TodayActionKind): ContentFormat | null {
  switch (kind) {
    case 'write_medium':
      return 'medium';
    case 'write_linkedin':
      return 'linkedin';
    case 'write_instagram':
      return 'instagram-story';
    default:
      return null;
  }
}

export function TodayExecuteAction({
  oneBigMove,
  actionKind,
  actionTopic,
  onOpenDecisions,
  className = ''
}: TodayExecuteActionProps) {
  const { locale, t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GeneratedResult | null>(null);
  const [copied, setCopied] = useState(false);

  const resolved = useMemo(
    () => resolveTodayAction({ oneBigMove, actionKind, actionTopic }),
    [oneBigMove, actionKind, actionTopic]
  );

  const buttonLabel = useMemo(() => {
    switch (resolved.kind) {
      case 'write_medium':
        return t('today.execute.writeMedium');
      case 'write_linkedin':
        return t('today.execute.writeLinkedin');
      case 'write_instagram':
        return t('today.execute.writeInstagram');
      case 'open_decisions':
        return t('today.execute.openDecisions');
      default:
        return t('today.execute.prepare');
    }
  }, [resolved.kind, t]);

  async function handleExecute() {
    setError(null);
    setCopied(false);

    if (resolved.kind === 'open_decisions') {
      onOpenDecisions?.();
      return;
    }

    const format = formatForKind(resolved.kind);
    if (!format) {
      setError(t('today.execute.notExecutable'));
      return;
    }

    setLoading(true);
    setResult(null);

    const response = await fetch('/api/content/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sourceType: 'freeform',
        topic: resolved.topic,
        formats: [format],
        locale
      })
    });

    const body = await response.json().catch(() => ({}));
    setLoading(false);

    if (!response.ok) {
      setError(typeof body.error === 'string' ? body.error : t('today.execute.error'));
      return;
    }

    const content =
      format === 'medium'
        ? body.medium
        : format === 'linkedin'
          ? body.linkedin
          : Array.isArray(body.instagramStory)
            ? body.instagramStory.map((card: string, index: number) => `${index + 1}. ${card}`).join('\n\n')
            : '';

    if (!content?.trim()) {
      setError(t('today.execute.error'));
      return;
    }

    setResult({ format, content: content.trim() });
  }

  async function handleCopy() {
    if (!result?.content) {
      return;
    }

    try {
      await navigator.clipboard.writeText(result.content);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setError(t('content.copyError'));
    }
  }

  if (resolved.kind === 'none') {
    return null;
  }

  return (
    <div className={`today-execute${className ? ` ${className}` : ''}`} data-testid="today-execute">
      <button
        type="button"
        className="insights-action-chip"
        data-testid="today-execute-button"
        disabled={loading}
        onClick={() => void handleExecute()}
      >
        {loading ? t('today.execute.loading') : buttonLabel}
        {!loading ? <span aria-hidden="true">→</span> : null}
      </button>

      {error ? <p className="today-execute-error">{error}</p> : null}

      {result ? (
        <div className="today-execute-result" data-testid="today-execute-result">
          <div className="today-execute-result-head">
            <span className="kicker">{t(`content.formats.${result.format === 'instagram-story' ? 'instagram' : result.format}`)}</span>
            <button type="button" className="content-generator-copy" onClick={() => void handleCopy()}>
              {copied ? t('content.copied') : t('content.copy')}
            </button>
          </div>
          <textarea className="content-generator-textarea" readOnly value={result.content} rows={12} />
        </div>
      ) : null}
    </div>
  );
}
