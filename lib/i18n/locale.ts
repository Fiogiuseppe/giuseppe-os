export type AppLocale = 'it' | 'en';

export function resolveLocale(value?: string | null): AppLocale {
  return value === 'en' ? 'en' : 'it';
}

export function pickLocale<T>(locale: AppLocale, it: T, en: T): T {
  return locale === 'en' ? en : it;
}
