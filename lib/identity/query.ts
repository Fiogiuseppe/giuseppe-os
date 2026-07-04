import { getNode, subgraph } from './graph';
import type {
  IdentityEdge,
  IdentityEdgeKind,
  IdentityGraph,
  IdentityNode,
  IdentityNodeKind,
  IdentityQuery,
  IdentityQueryResult
} from './types';

function normalizeText(value: string): string {
  return value.trim().toLowerCase();
}

function edgeMatchesKinds(edge: IdentityEdge, kinds?: IdentityEdgeKind[]): boolean {
  return !kinds || kinds.length === 0 || kinds.includes(edge.kind);
}

function nodeMatchesKinds(node: IdentityNode, kinds?: IdentityNodeKind[]): boolean {
  return !kinds || kinds.length === 0 || kinds.includes(node.kind);
}

function collectEdgesForNode(
  graph: IdentityGraph,
  nodeId: string,
  direction: 'out' | 'in' | 'both',
  edgeKinds?: IdentityEdgeKind[]
): IdentityEdge[] {
  const edges: IdentityEdge[] = [];

  if (direction === 'out' || direction === 'both') {
    edges.push(...graph.edges.filter(edge => edge.from === nodeId && edgeMatchesKinds(edge, edgeKinds)));
  }

  if (direction === 'in' || direction === 'both') {
    edges.push(...graph.edges.filter(edge => edge.to === nodeId && edgeMatchesKinds(edge, edgeKinds)));
  }

  return edges;
}

function bfsNeighbors(
  graph: IdentityGraph,
  startId: string,
  depth: number,
  direction: 'out' | 'in' | 'both',
  edgeKinds?: IdentityEdgeKind[],
  nodeKinds?: IdentityNodeKind[]
): { nodes: IdentityNode[]; edges: IdentityEdge[] } {
  const visited = new Set<string>([startId]);
  const collectedEdges = new Map<string, IdentityEdge>();
  let frontier = [startId];

  for (let level = 0; level < depth; level += 1) {
    const nextFrontier: string[] = [];

    for (const nodeId of frontier) {
      const edges = collectEdgesForNode(graph, nodeId, direction, edgeKinds);
      for (const edge of edges) {
        collectedEdges.set(edge.id, edge);
        const neighborId = edge.from === nodeId ? edge.to : edge.from;
        if (!visited.has(neighborId)) {
          visited.add(neighborId);
          nextFrontier.push(neighborId);
        }
      }
    }

    frontier = nextFrontier;
  }

  const nodes = graph.nodes.filter(
    node => visited.has(node.id) && nodeMatchesKinds(node, nodeKinds)
  );
  const edges = Array.from(collectedEdges.values());

  return { nodes, edges };
}

function findPaths(
  graph: IdentityGraph,
  from: string,
  to: string,
  maxDepth: number,
  edgeKinds?: IdentityEdgeKind[]
): string[][] {
  const paths: string[][] = [];
  const queue: Array<{ nodeId: string; path: string[] }> = [{ nodeId: from, path: [from] }];

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) {
      continue;
    }

    if (current.path.length > maxDepth + 1) {
      continue;
    }

    if (current.nodeId === to && current.path.length > 1) {
      paths.push(current.path);
      continue;
    }

    const outgoing = graph.edges.filter(
      edge => edge.from === current.nodeId && edgeMatchesKinds(edge, edgeKinds)
    );

    for (const edge of outgoing) {
      if (current.path.includes(edge.to)) {
        continue;
      }

      queue.push({
        nodeId: edge.to,
        path: [...current.path, edge.to]
      });
    }
  }

  return paths;
}

export function queryIdentityGraph(graph: IdentityGraph, query: IdentityQuery): IdentityQueryResult {
  switch (query.type) {
    case 'node': {
      const node = getNode(graph, query.id);
      return {
        query,
        nodes: node ? [node] : [],
        edges: []
      };
    }

    case 'kind': {
      const nodes = graph.nodes.filter(
        node =>
          node.kind === query.kind && (query.status === undefined || node.status === query.status)
      );
      return { query, nodes, edges: [] };
    }

    case 'neighbors': {
      const depth = query.depth ?? 1;
      const { nodes, edges } = bfsNeighbors(
        graph,
        query.id,
        depth,
        query.direction ?? 'both',
        query.edgeKinds,
        query.nodeKinds
      );
      return { query, nodes, edges };
    }

    case 'path': {
      const maxDepth = query.maxDepth ?? 6;
      const paths = findPaths(graph, query.from, query.to, maxDepth, query.edgeKinds);
      const nodeIds = new Set<string>();
      const edgeIds = new Set<string>();

      for (const path of paths) {
        for (const nodeId of path) {
          nodeIds.add(nodeId);
        }
        for (let index = 0; index < path.length - 1; index += 1) {
          const from = path[index];
          const to = path[index + 1];
          const edge = graph.edges.find(
            candidate =>
              candidate.from === from &&
              candidate.to === to &&
              edgeMatchesKinds(candidate, query.edgeKinds)
          );
          if (edge) {
            edgeIds.add(edge.id);
          }
        }
      }

      const slice = subgraph(graph, nodeIds);
      return {
        query,
        nodes: slice.nodes,
        edges: slice.edges.filter(edge => edgeIds.has(edge.id)),
        paths
      };
    }

    case 'traverse': {
      const { nodes, edges } = bfsNeighbors(
        graph,
        query.from,
        query.maxDepth,
        query.direction ?? 'out',
        query.edgeKinds
      );
      return { query, nodes, edges };
    }

    case 'search': {
      const needle = normalizeText(query.text);
      const limit = query.limit ?? 20;
      const nodes = graph.nodes
        .filter(node => {
          if (!nodeMatchesKinds(node, query.kinds)) {
            return false;
          }
          const haystack = normalizeText(`${node.label} ${node.description ?? ''}`);
          return haystack.includes(needle);
        })
        .slice(0, limit);

      return { query, nodes, edges: [] };
    }

    case 'related': {
      const depth = query.maxDepth ?? 2;
      const { nodes, edges } = bfsNeighbors(
        graph,
        query.id,
        depth,
        'both',
        undefined,
        query.kinds
      );
      return { query, nodes, edges };
    }

    default: {
      const exhaustive: never = query;
      return { query: exhaustive, nodes: [], edges: [] };
    }
  }
}
