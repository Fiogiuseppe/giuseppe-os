'use client';

import { useEffect } from 'react';
import { ContentGeneratorStage } from './ContentGeneratorStage';
import { useLanguage } from '../lib/i18n/LanguageContext';
import { useContentStudio } from '../lib/contentStudio/ContentStudioContext';

export function GlobalContentStudio({ hideTrigger = false }: { hideTrigger?: boolean }) {
  const { t } = useLanguage();
  const { isOpen, config, open, close } = useContentStudio();

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        close();
      }
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, close]);

  return (
    <>
      {!isOpen && !hideTrigger ? (
        <button
          type="button"
          className="global-content-trigger insights-action-chip"
          data-testid="global-content-trigger"
          aria-haspopup="dialog"
          onClick={() => open()}
        >
          {t('content.open')}
          <span aria-hidden="true">→</span>
        </button>
      ) : null}

      {isOpen ? (
        <div
          className="content-studio-overlay"
          role="dialog"
          aria-modal="true"
          aria-label={t('content.studioTitle')}
          data-testid="content-studio-overlay"
        >
          <div className="content-studio-overlay-panel">
            <ContentGeneratorStage
              sourceType={config.sourceType}
              sourceId={config.sourceId}
              topic={config.topic}
              onClose={close}
            />
          </div>
        </div>
      ) : null}
    </>
  );
}
