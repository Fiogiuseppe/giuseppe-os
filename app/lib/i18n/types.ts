export type Locale = 'it' | 'en';

export const LOCALE_STORAGE_KEY = 'giuseppe-os-locale';

export const DEFAULT_LOCALE: Locale =
  process.env.NEXT_PUBLIC_DEFAULT_LOCALE === 'en' ? 'en' : 'it';

export type MessageKey = keyof typeof import('./messages').messages.it;
