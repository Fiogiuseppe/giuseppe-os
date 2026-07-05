'use client';

import { useMemo, useState } from 'react';
import { useLanguage } from '../lib/i18n/LanguageContext';
import type { ContentFormat, ContentSourceType } from '../../lib/content/types';

type ContentGeneratorPanelProps = {
  sourceType: ContentSourceType;
  sourceId?: string;
  topic?: string;
  className?: string;
};

type GeneratedContent = {
  medium?: string;
  linkedin?: string;
  instagramStory?: string[];
};

const FORMATS: ContentFormat[] = ['medium', 'linkedin', 'instagram-story'];

export function ContentGeneratorPanel({
  sourceType,
  sourceId,
  topic: initialTopic,
  className = ''
}: ContentGeneratorPanelProps) {
  const { locale, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [topic, setTopic] = useState(initialTopic ?? '');
  const [selectedFormats, setSelectedFormats] = useState<ContentFormat[]>(['medium', 'linkedin', 'instagram-story']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<GeneratedContent | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const formatLabels = useMemo(
    () => ({
      medium: t('content.formats.medium'),
      linkedin: t('content.formats.linkedin'),
      'instagram-story': t('content.formats.instagram')
    }),
    [t]
  );

  function toggleFormat(format: ContentFormat) {
    setSelectedFormats(current =>
      current.includes(format) ? current.filter(item => item !== format) : [...current, format]
    );
  }

  async function handleGenerate() {
    if (selectedFormats.length === 0) {
      return;
    }

    setLoading(true);
    setError(null);

    const response = await fetch('/api/content/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sourceType,
        sourceId,
        topic:
          sourceType === 'freeform'
            ? topic.trim()
            : sourceType === 'insight'
              ? initialTopic ?? topic.trim()
              : undefined,
        formats: selectedFormats,
        locale
      })
    });

    const body = await response.json().catch(() => ({}));
    setLoading(false);

    if (!response.ok) {
      setError(typeof body.error === 'string' ? body.error : t('content.error'));
      return;
    }

    setResults({
      medium: body.medium,
      linkedin: body.linkedin,
      instagramStory: body.instagramStory
    });
  }

  async function copyText(key: string, value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedKey(key);
      window.setTimeout(() => setCopiedKey(current => (current === key ? null : current)), 1800);
    } catch {
      setError(t('content.copyError'));
    }
  }

  return (
    <div className={`content-generator${className ? ` ${className}` : ''}`} data-testid="content-generator">
      <button type="button" className="insights-action-chip content-generator-toggle" onClick={() => setOpen(current => !current)}>
        {t('content.open')}
        <span aria-hidden="true">{open ? '↑' : '→'}</span>
      </button>

      {open && (
        <div className="content-generator-panel">
          {sourceType === 'freeform' && (
            <label className="content-generator-field">
              <span className="content-generator-label">{t('content.topicLabel')}</span>
              <input
                className="content-generator-input"
                data-testid="content-generator-topic"
                value={topic}
                onChange={event => setTopic(event.target.value)}
                placeholder={t('content.topicPlaceholder')}
              />
            </label>
          )}

          <fieldset className="content-generator-formats">
            <legend className="content-generator-label">{t('content.formatsLegend')}</legend>
            {FORMATS.map(format => (
              <label key={format} className="content-generator-format">
                <input
                  type="checkbox"
                  checked={selectedFormats.includes(format)}
                  onChange={() => toggleFormat(format)}
                />
                <span>{formatLabels[format]}</span>
              </label>
            ))}
          </fieldset>

          <button
            type="button"
            className="insights-action-chip content-generator-run"
            data-testid="content-generator-run"
            disabled={loading || selectedFormats.length === 0}
            onClick={() => void handleGenerate()}
          >
            {loading ? t('content.loading') : t('content.generate')}
          </button>

          {error && <p className="content-generator-error">{error}</p>}

          {results?.medium && (
            <div className="content-generator-result">
              <div className="content-generator-result-head">
                <span className="kicker">{formatLabels.medium}</span>
                <button type="button" className="content-generator-copy" onClick={() => void copyText('medium', results.medium!)}>
                  {copiedKey === 'medium' ? t('content.copied') : t('content.copy')}
                </button>
              </div>
              <textarea className="content-generator-textarea" readOnly value={results.medium} rows={14} />
            </div>
          )}

          {results?.linkedin && (
            <div className="content-generator-result">
              <div className="content-generator-result-head">
                <span className="kicker">{formatLabels.linkedin}</span>
                <button
                  type="button"
                  className="content-generator-copy"
                  onClick={() => void copyText('linkedin', results.linkedin!)}
                >
                  {copiedKey === 'linkedin' ? t('content.copied') : t('content.copy')}
                </button>
              </div>
              <textarea className="content-generator-textarea" readOnly value={results.linkedin} rows={8} />
            </div>
          )}

          {results?.instagramStory && (
            <div className="content-generator-result">
              <div className="content-generator-result-head">
                <span className="kicker">{formatLabels['instagram-story']}</span>
                <button
                  type="button"
                  className="content-generator-copy"
                  onClick={() => void copyText('instagram', results.instagramStory!.join('\n\n'))}
                >
                  {copiedKey === 'instagram' ? t('content.copied') : t('content.copy')}
                </button>
              </div>
              <textarea
                className="content-generator-textarea"
                readOnly
                value={results.instagramStory.map((card, index) => `${index + 1}. ${card}`).join('\n\n')}
                rows={8}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
