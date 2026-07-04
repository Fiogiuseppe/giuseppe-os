'use client';

import { useLanguage } from '../lib/i18n/LanguageContext';

type DecisionIntakePanelProps = {
  intakePhase: 'opening' | 'listening' | 'reasoning';
  decision: string;
  currentAnswer: string;
  intakeQuestion: string | null;
  decisionLoading: boolean;
  decisionError: string | null;
  onDecisionChange: (value: string) => void;
  onAnswerChange: (value: string) => void;
  onContinue: () => void;
};

export function DecisionIntakePanel({
  intakePhase,
  decision,
  currentAnswer,
  intakeQuestion,
  decisionLoading,
  decisionError,
  onDecisionChange,
  onAnswerChange,
  onContinue
}: DecisionIntakePanelProps) {
  const { t } = useLanguage();

  const title =
    intakePhase === 'listening'
      ? intakeQuestion ?? t('decisions.openingPrompt')
      : t('viewHeadings.decisions');

  const inputValue = intakePhase === 'opening' ? decision : currentAnswer;
  const inputPlaceholder =
    intakePhase === 'opening' ? t('decisions.openingPlaceholder') : t('decisions.followupPlaceholder');
  const canSubmit =
    !decisionLoading && (intakePhase === 'opening' ? decision.trim().length > 0 : currentAnswer.trim().length > 0);

  function handleSubmit() {
    if (!canSubmit) {
      return;
    }

    onContinue();
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleSubmit();
    }
  }

  return (
    <div className="decision-stage" data-testid="decision-stage">
      <h1
        className="decision-stage-title view-title"
        data-testid={intakePhase === 'listening' ? 'decision-followup' : undefined}
      >
        {title}
      </h1>

      {intakePhase === 'listening' && decision.trim() && (
        <p className="decision-stage-context">{decision}</p>
      )}

      {intakePhase === 'reasoning' ? (
        <p className="decision-stage-reasoning">{t('decisions.reasoning')}</p>
      ) : (
        <div className="decision-command-bar">
          <input
            className="decision-command-input"
            data-testid={intakePhase === 'opening' ? 'decision-open-input' : 'decision-followup-input'}
            value={inputValue}
            onChange={event =>
              intakePhase === 'opening'
                ? onDecisionChange(event.target.value)
                : onAnswerChange(event.target.value)
            }
            placeholder={inputPlaceholder}
            onKeyDown={handleKeyDown}
            aria-label={intakePhase === 'opening' ? t('decisions.openingPrompt') : intakeQuestion ?? t('decisions.followupPlaceholder')}
          />
          <button
            className="decision-command-submit"
            type="button"
            data-testid="decision-continue"
            disabled={!canSubmit}
            aria-label={decisionLoading ? t('decisions.simulating') : t('decisions.continue')}
            onClick={handleSubmit}
          >
            <span aria-hidden="true">→</span>
          </button>
        </div>
      )}

      {decisionError && <p className="decision-error">{decisionError}</p>}
    </div>
  );
}
