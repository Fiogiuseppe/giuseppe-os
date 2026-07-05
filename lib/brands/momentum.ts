import { pickLocale, type AppLocale } from '../i18n/locale';

export type BrandMomentum = {
  momentum: number;
  signal: string;
};

function hashProject(name: string): number {
  let hash = 0;
  for (let index = 0; index < name.length; index += 1) {
    hash = (hash * 31 + name.charCodeAt(index)) % 9973;
  }
  return hash;
}

function statusBase(status: string): { min: number; max: number } {
  switch (status) {
    case 'active':
      return { min: 68, max: 88 };
    case 'slow-active':
      return { min: 42, max: 58 };
    case 'selective':
      return { min: 50, max: 65 };
    default:
      return { min: 55, max: 72 };
  }
}

function momentumSignal(locale: AppLocale, status: string, momentum: number): string {
  if (momentum >= 75) {
    return pickLocale(
      locale,
      'Ritmo solido — la marca sta compounding.',
      'Solid rhythm — the brand is compounding.'
    );
  }

  if (status === 'slow-active') {
    return pickLocale(
      locale,
      'Attiva ma lenta — serve una mossa questa settimana.',
      'Active but slow — needs one move this week.'
    );
  }

  if (status === 'selective') {
    return pickLocale(
      locale,
      'Selettiva per design — qualità sopra volume.',
      'Selective by design — quality over volume.'
    );
  }

  return pickLocale(
    locale,
    'Momentum in crescita — proteggi la concentrazione.',
    'Momentum building — protect focus.'
  );
}

export function computeBrandMomentum(
  projectName: string,
  status: string,
  locale: AppLocale = 'it'
): BrandMomentum {
  const { min, max } = statusBase(status);
  const span = max - min;
  const momentum = min + (hashProject(projectName) % (span + 1));

  return {
    momentum,
    signal: momentumSignal(locale, status, momentum)
  };
}
