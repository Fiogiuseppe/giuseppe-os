import type { AppLocale } from '../../lib/i18n/locale';
import type { DecisionCategory, CapitalKey } from '../decisionEngine';

export const CATEGORY_LABELS: Record<AppLocale, Record<DecisionCategory, string>> = {
  it: {
    real_estate: 'Immobiliare',
    emotional_purchase: 'Acquisto emotivo',
    career: 'Carriera',
    reputation: 'Reputazione',
    creative_project: 'Progetto creativo',
    finance: 'Finanza',
    life_decision: 'Decisione di vita'
  },
  en: {
    real_estate: 'Real estate',
    emotional_purchase: 'Emotional purchase',
    career: 'Career',
    reputation: 'Reputation',
    creative_project: 'Creative project',
    finance: 'Finance',
    life_decision: 'Life decision'
  }
};

export const CAPITAL_LABELS: Record<AppLocale, Record<CapitalKey, string>> = {
  it: {
    financial: 'Capitale finanziario',
    creative: 'Capitale creativo',
    reputation: 'Capitale reputazionale',
    social: 'Capitale sociale',
    knowledge: 'Capitale conoscenza',
    freedom: 'Capitale libertà'
  },
  en: {
    financial: 'Financial capital',
    creative: 'Creative capital',
    reputation: 'Reputation capital',
    social: 'Social capital',
    knowledge: 'Knowledge capital',
    freedom: 'Freedom capital'
  }
};

export function decisionCategoryLabel(category: DecisionCategory, locale: AppLocale): string {
  return CATEGORY_LABELS[locale][category];
}

export function capitalLabel(key: CapitalKey, locale: AppLocale): string {
  return CAPITAL_LABELS[locale][key];
}
