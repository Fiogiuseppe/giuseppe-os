'use client';

import { useCallback, useMemo, useState } from 'react';
import { useLanguage } from '../lib/i18n/LanguageContext';
import { ContentGeneratorPanel } from './ContentGeneratorPanel';
import type { DecisionReviewAnswers } from '../../lib/decision-learning/types';

export type DueReviewPayload = {
  id: string;
  decision: string;
  daysWaiting: number;
  category?: string;
};

type ReviewStep = 'intro' | 'didIt' | 'satisfaction' | 'sameDecision' | 'lesson' | 'submitting';

type DecisionReviewGateProps = {
  review: DueReviewPayload;
  onComplete: () => void;
};

export function DecisionReviewGate({ review, onComplete }: DecisionReviewGateProps) {
  const { t, locale } = useLanguage();
  const [step, setStep] = useState<ReviewStep>('intro');
  const [didIt, setDidIt] = useState<DecisionReviewAnswers['didIt'] | null>(null);
  const [satisfaction, setSatisfaction] = useState<number | null>(null);
  const [sameDecision, setSameDecision] = useState<DecisionReviewAnswers['sameDecision'] | null>(null);
  const [lesson, setLesson] = useState('');
  const [error, setError] = useState<string | null>(null);

  const title = useMemo(() => {
    if (step === 'intro') {
      return t('decisionReview.beforeWeContinue');
    }
    if (step === 'didIt') {
      return t('decisionReview.didYouDoIt');
    }
    if (step === 'satisfaction') {
      return t('decisionReview.howSatisfied');
    }
    if (step === 'sameDecision') {
      return t('decisionReview.sameDecision');
    }
    return t('decisionReview.whatLearned');
  }, [step, t]);

  const submitReview = useCallback(async () => {
    if (!didIt || satisfaction === null || !sameDecision) {
      return;
    }

    setStep('submitting');
    setError(null);

    const response = await fetch('/api/decisions/reviews/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        decisionId: review.id,
        didIt,
        satisfaction,
        sameDecision,
        lesson: lesson.trim() || undefined,
        locale
      })
    });

    const body = await response.json().catch(() => ({}));

    if (!response.ok) {
      setError(typeof body.error === 'string' ? body.error : t('decisionReview.error'));
      setStep('lesson');
      return;
    }

    onComplete();
  }, [didIt, satisfaction, sameDecision, lesson, review.id, locale, onComplete, t]);

  function handleStarSelect(value: number) {
    setSatisfaction(value);
    setStep('sameDecision');
  }

  function handleSameDecisionSelect(value: DecisionReviewAnswers['sameDecision']) {
    setSameDecision(value);
    if (value === 'no' || (satisfaction !== null && satisfaction <= 3)) {
      setStep('lesson');
      return;
    }
    void submitReview();
  }

  function handleDidItSelect(value: DecisionReviewAnswers['didIt']) {
    setDidIt(value);
    setStep('satisfaction');
  }

  return (
    <div className="decision-review-gate" data-testid="decision-review-gate">
      <p className="decision-review-kicker">{t('decisionReview.kicker')}</p>
      <h1 className="decision-review-title">{title}</h1>

      {step === 'intro' && (
        <div className="decision-review-body">
          <p className="decision-review-days">
            {t('decisionReview.daysAgo').replace('{days}', String(review.daysWaiting))}
          </p>
          <p className="decision-review-quote">&ldquo;{review.decision}&rdquo;</p>
          <p className="decision-review-prompt">{t('decisionReview.howDidItGo')}</p>
          <button
            type="button"
            className="decision-review-continue"
            data-testid="decision-review-start"
            onClick={() => setStep('didIt')}
          >
            {t('decisionReview.start')}
            <span aria-hidden="true">→</span>
          </button>
          <ContentGeneratorPanel sourceType="decision" sourceId={review.id} className="content-generator--review" />
        </div>
      )}

      {step === 'didIt' && (
        <div className="decision-review-options" role="group" aria-label={t('decisionReview.didYouDoIt')}>
          {(['yes', 'partial', 'no'] as const).map(option => (
            <button
              key={option}
              type="button"
              className="decision-review-chip"
              data-testid={`decision-review-did-${option}`}
              onClick={() => handleDidItSelect(option)}
            >
              {t(`decisionReview.didIt.${option}`)}
            </button>
          ))}
        </div>
      )}

      {step === 'satisfaction' && (
        <div className="decision-review-stars" role="group" aria-label={t('decisionReview.howSatisfied')}>
          {[1, 2, 3, 4, 5].map(value => (
            <button
              key={value}
              type="button"
              className={`decision-review-star${satisfaction === value ? ' decision-review-star--active' : ''}`}
              data-testid={`decision-review-star-${value}`}
              aria-label={`${value}`}
              onClick={() => handleStarSelect(value)}
            >
              ★
            </button>
          ))}
        </div>
      )}

      {step === 'sameDecision' && (
        <div className="decision-review-options" role="group" aria-label={t('decisionReview.sameDecision')}>
          {(['yes', 'no', 'unsure'] as const).map(option => (
            <button
              key={option}
              type="button"
              className="decision-review-chip"
              data-testid={`decision-review-same-${option}`}
              onClick={() => handleSameDecisionSelect(option)}
            >
              {t(`decisionReview.same.${option}`)}
            </button>
          ))}
        </div>
      )}

      {step === 'lesson' && (
        <div className="decision-review-lesson">
          <div className="decision-command-bar">
            <input
              className="decision-command-input"
              data-testid="decision-review-lesson"
              value={lesson}
              onChange={event => setLesson(event.target.value)}
              placeholder={t('decisionReview.lessonPlaceholder')}
              onKeyDown={event => {
                if (event.key === 'Enter') {
                  void submitReview();
                }
              }}
            />
            <button
              type="button"
              className="decision-command-submit"
              data-testid="decision-review-submit"
              onClick={() => void submitReview()}
            >
              <span aria-hidden="true">→</span>
            </button>
          </div>
          <button type="button" className="decision-review-skip" onClick={() => void submitReview()}>
            {t('decisionReview.skipLesson')}
          </button>
        </div>
      )}

      {step === 'submitting' && <p className="decision-review-loading">{t('decisionReview.saving')}</p>}
      {error && <p className="decision-review-error">{error}</p>}
    </div>
  );
}
