import { AsyncLocalStorage } from 'async_hooks';

export type AICallMeta = {
  page: string;
  reason: string;
};

const storage = new AsyncLocalStorage<AICallMeta>();

export function runWithAICallMeta<T>(meta: AICallMeta, fn: () => T): T {
  return storage.run(meta, fn);
}

export function getAICallMeta(): AICallMeta | undefined {
  return storage.getStore();
}

export function intentToPage(intent: string): string {
  switch (intent) {
    case 'decide':
      return 'decisions';
    case 'awareness':
    case 'reflect':
    case 'learn':
      return 'insights';
    case 'potential':
      return 'create';
    case 'query':
      return 'brain';
    default:
      return 'brain';
  }
}
