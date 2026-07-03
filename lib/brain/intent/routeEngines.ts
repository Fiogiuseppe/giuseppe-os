import type { BrainIntent, ContextTopic, EngineRoutePlan } from '../types';

export function routeEngines(intent: BrainIntent, topics: ContextTopic[]): EngineRoutePlan {
  const engines = new Set<EngineRoutePlan['engines'][number]>(['context', 'memory', 'reality']);

  switch (intent) {
    case 'decide':
      engines.add('decision');
      engines.add('awareness');
      break;
    case 'reflect':
      engines.add('awareness');
      engines.add('learning');
      break;
    case 'awareness':
      engines.add('awareness');
      break;
    case 'potential':
      engines.add('potential');
      break;
    case 'learn':
      engines.add('learning');
      engines.add('awareness');
      break;
    case 'query':
      if (topics.includes('patterns')) engines.add('awareness');
      if (topics.includes('projects') || topics.includes('reputation')) engines.add('potential');
      break;
    default:
      break;
  }

  return {
    engines: Array.from(engines),
    topics
  };
}
