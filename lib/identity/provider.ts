import { formatIdentityGraphForBrain } from './brainContext';
import { queryIdentityGraph } from './query';
import type { IdentityGraphStore } from './store';
import { emptyIdentityGraphStore } from './store';
import type { IdentityGraph, IdentityQuery, IdentityQueryResult } from './types';

export interface IdentityGraphProvider {
  getGraph(): Promise<IdentityGraph>;
  query(query: IdentityQuery): Promise<IdentityQueryResult>;
  formatForBrain(result: IdentityQueryResult): string;
}

export function createIdentityGraphProvider(store: IdentityGraphStore): IdentityGraphProvider {
  return {
    async getGraph() {
      return store.load();
    },
    async query(query) {
      const graph = await store.load();
      return queryIdentityGraph(graph, query);
    },
    formatForBrain(result) {
      return formatIdentityGraphForBrain(result);
    }
  };
}

export const identityGraphProvider = createIdentityGraphProvider(emptyIdentityGraphStore);
