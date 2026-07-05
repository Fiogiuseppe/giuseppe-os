'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from '../lib/i18n/LanguageContext';
import type { MemoryMediaSuggestion } from '../../lib/memory/suggestions/types';

const CLOUD_SLOTS = ['1', '2', '3', '4', '5'] as const;

export function MemorySuggestionClouds() {
  const { locale, t } = useLanguage();
  const [items, setItems] = useState<MemoryMediaSuggestion[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function loadSuggestions() {
      const response = await fetch(`/api/memory/suggestions?locale=${locale}`);
      const body = await response.json().catch(() => ({}));

      if (cancelled || !response.ok || !Array.isArray(body.items)) {
        return;
      }

      setItems(body.items as MemoryMediaSuggestion[]);
    }

    void loadSuggestions();

    return () => {
      cancelled = true;
    };
  }, [locale]);

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="memory-clouds" data-testid="memory-suggestion-clouds" aria-label={t('memory.suggestionsLabel')}>
      {items.map((item, index) => (
        <div
          key={item.id}
          className={`memory-cloud memory-cloud--${CLOUD_SLOTS[index % CLOUD_SLOTS.length]}`}
          style={{ animationDelay: `${0.35 + index * 0.18}s` }}
          title={item.reason}
        >
          <span className="memory-cloud-type">
            {item.type === 'book' ? t('memory.suggestionBook') : t('memory.suggestionPodcast')}
          </span>
          <span className="memory-cloud-title">{item.title}</span>
          <span className="memory-cloud-author">{item.author}</span>
        </div>
      ))}
    </div>
  );
}
