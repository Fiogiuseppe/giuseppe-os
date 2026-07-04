import { createEmptyIdentityGraph } from './graph';
import type { IdentityGraph } from './types';

export interface IdentityGraphStore {
  load(): Promise<IdentityGraph>;
  save(graph: IdentityGraph): Promise<void>;
  reset(): Promise<void>;
}

export function createInMemoryIdentityGraphStore(
  seed: IdentityGraph | null = null
): IdentityGraphStore {
  let graph = seed ?? createEmptyIdentityGraph();

  return {
    async load() {
      return graph;
    },
    async save(next) {
      graph = next;
    },
    async reset() {
      graph = createEmptyIdentityGraph();
    }
  };
}

/** Default store — empty graph, no automatic population. */
export const emptyIdentityGraphStore = createInMemoryIdentityGraphStore();
