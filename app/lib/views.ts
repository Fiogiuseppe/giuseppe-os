export type AppView = 'today' | 'decisions' | 'insights' | 'brands' | 'create' | 'memory';

export const APP_VIEWS: AppView[] = ['today', 'decisions', 'insights', 'brands', 'create', 'memory'];

export function isAppView(value: string): value is AppView {
  return APP_VIEWS.includes(value as AppView);
}
