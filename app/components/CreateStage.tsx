'use client';

import { useMemo, useRef, useState, type ChangeEvent } from 'react';
import { useLanguage } from '../lib/i18n/LanguageContext';
import { useContentStudio } from '../lib/contentStudio/ContentStudioContext';

type CreativeOutputKind = 'text' | 'visual' | 'video';

type ReferenceFile = {
  id: string;
  name: string;
  previewUrl: string;
  kind: 'image' | 'other';
};

const OUTPUT_KINDS: CreativeOutputKind[] = ['text', 'visual', 'video'];

export function CreateStage() {
  const { t } = useLanguage();
  const { open } = useContentStudio();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [brief, setBrief] = useState('');
  const [outputKind, setOutputKind] = useState<CreativeOutputKind>('text');
  const [references, setReferences] = useState<ReferenceFile[]>([]);

  const canGenerate = brief.trim().length > 0 || references.length > 0;

  const outputLabels = useMemo(
    () => ({
      text: t('createStudio.outputs.text'),
      visual: t('createStudio.outputs.visual'),
      video: t('createStudio.outputs.video')
    }),
    [t]
  );

  function handleReferencePick(event: ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;
    if (!files?.length) {
      return;
    }

    const next = Array.from(files).map(file => {
      const isImage = file.type.startsWith('image/');
      return {
        id: `${file.name}-${file.lastModified}`,
        name: file.name,
        previewUrl: isImage ? URL.createObjectURL(file) : '',
        kind: isImage ? 'image' : 'other'
      } satisfies ReferenceFile;
    });

    setReferences(current => [...current, ...next].slice(0, 8));
    event.target.value = '';
  }

  function removeReference(id: string) {
    setReferences(current => {
      const target = current.find(item => item.id === id);
      if (target?.previewUrl) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return current.filter(item => item.id !== id);
    });
  }

  function handleGenerate() {
    if (!canGenerate) {
      return;
    }

    const referenceNote =
      references.length > 0
        ? `\n\nReferences attached: ${references.map(item => item.name).join(', ')}`
        : '';

    open({
      sourceType: 'freeform',
      topic: `${brief.trim()}${referenceNote}`.trim()
    });
  }

  return (
    <div className="create-stage creative-studio-stage" data-testid="create-stage">
      <h1 className="create-stage-title view-title">{t('viewHeadings.create')}</h1>
      <p className="create-stage-headline">{t('createStudio.lead')}</p>

      <section className="creative-studio-panel">
        <div className="creative-studio-field">
          <label className="creative-studio-label" htmlFor="creative-studio-brief">
            {t('createStudio.briefLabel')}
          </label>
          <textarea
            id="creative-studio-brief"
            className="creative-studio-textarea"
            rows={4}
            value={brief}
            placeholder={t('createStudio.briefPlaceholder')}
            onChange={event => setBrief(event.target.value)}
          />
        </div>

        <div className="creative-studio-field">
          <span className="creative-studio-label">{t('createStudio.referencesLabel')}</span>
          <div className="creative-studio-references">
            {references.map(reference => (
              <div key={reference.id} className="creative-studio-reference">
                {reference.kind === 'image' ? (
                  <img src={reference.previewUrl} alt="" className="creative-studio-reference-image" />
                ) : (
                  <span className="creative-studio-reference-file" aria-hidden="true">
                    ↗
                  </span>
                )}
                <span className="creative-studio-reference-name">{reference.name}</span>
                <button
                  type="button"
                  className="creative-studio-reference-remove"
                  aria-label={t('createStudio.removeReference')}
                  onClick={() => removeReference(reference.id)}
                >
                  ×
                </button>
              </div>
            ))}
            <button
              type="button"
              className="creative-studio-reference-add"
              onClick={() => fileInputRef.current?.click()}
            >
              {t('createStudio.addReference')}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              className="creative-studio-file-input"
              accept="image/*,video/*,.pdf,.txt,.md"
              multiple
              onChange={handleReferencePick}
            />
          </div>
          <p className="creative-studio-hint">{t('createStudio.referencesHint')}</p>
        </div>

        <div className="creative-studio-field">
          <span className="creative-studio-label">{t('createStudio.outputLabel')}</span>
          <div className="creative-studio-output-grid" role="group" aria-label={t('createStudio.outputLabel')}>
            {OUTPUT_KINDS.map(kind => (
              <button
                key={kind}
                type="button"
                className={`insights-action-chip${outputKind === kind ? ' insights-action-chip--active' : ''}`}
                aria-pressed={outputKind === kind}
                disabled={kind !== 'text'}
                onClick={() => setOutputKind(kind)}
              >
                {outputLabels[kind]}
                {kind !== 'text' ? (
                  <span className="creative-studio-soon">{t('createStudio.comingSoon')}</span>
                ) : null}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          className="insights-action-chip creative-studio-generate"
          disabled={!canGenerate}
          onClick={handleGenerate}
        >
          {t('createStudio.generate')}
          <span aria-hidden="true">→</span>
        </button>
      </section>

      <p className="insights-built-over-time">{t('createStudio.note')}</p>
    </div>
  );
}
