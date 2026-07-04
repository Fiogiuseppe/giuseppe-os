'use client';

import { useMemo, useState } from 'react';
import { useLanguage } from '../lib/i18n/LanguageContext';
import type { ContentFormat, ContentSourceType } from '../../lib/content/types';

type ContentGeneratorStageProps = {
  sourceType: ContentSourceType;
  sourceId?: string;
  topic?: string;
  onClose: () => void;
};

type GeneratedContent = {
  medium?: string;
  linkedin?: string;
  instagramStory?: string[];
};

const FORMATS: ContentFormat[] = ['medium', 'linkedin', 'instagram-story'];

export function ContentGeneratorStage({
  sourceType,
  sourceId,
  topic: initialTopic,
  onClose
}: ContentGeneratorStageProps) {
  const { t } = useLanguage();
  const [topic, setTopic] = useState(initialTopic ?? '');
  const [selectedFormats, setSelectedFormats] = useState<ContentFormat[]>([
    'medium',
    'linkedin',
    'instagram-story'
  ]);
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

  const canGenerate =
    !loading &&
    selectedFormats.length > 0 &&
    (sourceType !== 'freeform' || topic.trim().length > 0);

  function toggleFormat(format: ContentFormat) {
    setSelectedFormats(current =>
      current.includes(format) ? current.filter(item => item !== format) : [...current, format]
    );
  }

  async function handleGenerate() {
    if (!canGenerate) {
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
        formats: selectedFormats
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
    <div className="content-studio" data-testid="content-studio">
      <button type="button" className="reading-expand-close content-studio-close" onClick={onClose}>
        <span aria-hidden="true">←</span> {t('disclosure.closeReading')}
      </button>

      <header className="content-studio-header">
        <h1 className="content-studio-title view-title">{t('content.studioTitle')}</h1>
        <p className="content-studio-lead">{t('content.studioLead')}</p>
      </header>

      <div className="content-studio-compose">
        {(sourceType === 'freeform' || sourceType === 'insight') && (
          <label className="content-studio-topic-field">
            <span className="content-generator-label">{t('content.topicLabel')}</span>
            <textarea
              className="content-studio-topic"
              data-testid="content-generator-topic"
              value={topic}
              onChange={event => setTopic(event.target.value)}
              placeholder={t('content.topicPlaceholder')}
              rows={4}
            />
          </label>
        )}

        <fieldset className="content-generator-formats content-studio-formats">
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
          className="insights-action-chip content-studio-run"
          data-testid="content-generator-run"
          disabled={!canGenerate}
          onClick={() => void handleGenerate()}
        >
          {loading ? t('content.loading') : t('content.generate')}
          {!loading ? <span aria-hidden="true">→</span> : null}
        </button>

        {error ? <p className="content-generator-error">{error}</p> : null}
      </div>

      {results ? (
        <div className="content-studio-results" data-testid="content-studio-results">
          {results.medium ? (
            <article className="content-doc-section">
              <div className="content-doc-head">
                <span className="kicker">{formatLabels.medium}</span>
                <button
                  type="button"
                  className="content-generator-copy"
                  onClick={() => void copyText('medium', results.medium!)}
                >
                  {copiedKey === 'medium' ? t('content.copied') : t('content.copy')}
                </button>
              </div>
              <div className="content-doc-body">{results.medium}</div>
            </article>
          ) : null}

          {results.linkedin ? (
            <article className="content-doc-section">
              <div className="content-doc-head">
                <span className="kicker">{formatLabels.linkedin}</span>
                <button
                  type="button"
                  className="content-generator-copy"
                  onClick={() => void copyText('linkedin', results.linkedin!)}
                >
                  {copiedKey === 'linkedin' ? t('content.copied') : t('content.copy')}
                </button>
              </div>
              <div className="content-doc-body">{results.linkedin}</div>
            </article>
          ) : null}

          {results.instagramStory ? (
            <article className="content-doc-section">
              <div className="content-doc-head">
                <span className="kicker">{formatLabels['instagram-story']}</span>
                <button
                  type="button"
                  className="content-generator-copy"
                  onClick={() =>
                    void copyText('instagram', results.instagramStory!.join('\n\n'))
                  }
                >
                  {copiedKey === 'instagram' ? t('content.copied') : t('content.copy')}
                </button>
              </div>
              <div className="content-doc-body">
                {results.instagramStory.map((card, index) => (
                  <p key={`${index}-${card.slice(0, 24)}`} className="content-doc-card">
                    <span className="content-doc-card-index">{index + 1}</span>
                    {card}
                  </p>
                ))}
              </div>
            </article>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
