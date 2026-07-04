import { AsyncLocalStorage } from 'async_hooks';

type AIRequestContext = {
  aiLive: boolean;
};

const storage = new AsyncLocalStorage<AIRequestContext>();

export function runWithAIRequestContext<T>(context: AIRequestContext, fn: () => T): T {
  return storage.run(context, fn);
}

export function isAIRequestLiveEnabled(): boolean {
  return storage.getStore()?.aiLive === true;
}
