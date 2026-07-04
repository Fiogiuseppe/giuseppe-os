import { IDENTITY_GRAPH_VERSION } from './types';
import type {
  IdentityEdge,
  IdentityGraph,
  IdentityGraphValidationIssue,
  IdentityGraphValidationReport,
  IdentityNode
} from './types';

export function createEmptyIdentityGraph(now = new Date()): IdentityGraph {
  const timestamp = now.toISOString();
  return {
    version: IDENTITY_GRAPH_VERSION,
    updatedAt: timestamp,
    nodes: [],
    edges: []
  };
}

export function touchIdentityGraph(graph: IdentityGraph, now = new Date()): IdentityGraph {
  return {
    ...graph,
    updatedAt: now.toISOString()
  };
}

export function indexNodes(graph: IdentityGraph): Map<string, IdentityNode> {
  return new Map(graph.nodes.map(node => [node.id, node]));
}

export function indexEdges(graph: IdentityGraph): Map<string, IdentityEdge> {
  return new Map(graph.edges.map(edge => [edge.id, edge]));
}

export function addNode(graph: IdentityGraph, node: IdentityNode): IdentityGraph {
  if (graph.nodes.some(existing => existing.id === node.id)) {
    throw new Error(`Identity node already exists: ${node.id}`);
  }

  return touchIdentityGraph({
    ...graph,
    nodes: [...graph.nodes, node]
  });
}

export function addEdge(graph: IdentityGraph, edge: IdentityEdge): IdentityGraph {
  if (graph.edges.some(existing => existing.id === edge.id)) {
    throw new Error(`Identity edge already exists: ${edge.id}`);
  }

  const nodes = indexNodes(graph);
  if (!nodes.has(edge.from) || !nodes.has(edge.to)) {
    throw new Error(`Identity edge references missing node: ${edge.id}`);
  }

  return touchIdentityGraph({
    ...graph,
    edges: [...graph.edges, edge]
  });
}

export function removeNode(graph: IdentityGraph, nodeId: string): IdentityGraph {
  return touchIdentityGraph({
    ...graph,
    nodes: graph.nodes.filter(node => node.id !== nodeId),
    edges: graph.edges.filter(edge => edge.from !== nodeId && edge.to !== nodeId)
  });
}

export function removeEdge(graph: IdentityGraph, edgeId: string): IdentityGraph {
  return touchIdentityGraph({
    ...graph,
    edges: graph.edges.filter(edge => edge.id !== edgeId)
  });
}

export function getNode(graph: IdentityGraph, nodeId: string): IdentityNode | undefined {
  return graph.nodes.find(node => node.id === nodeId);
}

export function getOutgoingEdges(graph: IdentityGraph, nodeId: string): IdentityEdge[] {
  return graph.edges.filter(edge => edge.from === nodeId);
}

export function getIncomingEdges(graph: IdentityGraph, nodeId: string): IdentityEdge[] {
  return graph.edges.filter(edge => edge.to === nodeId);
}

export function validateIdentityGraph(graph: IdentityGraph): IdentityGraphValidationReport {
  const issues: IdentityGraphValidationIssue[] = [];
  const nodeIds = new Set<string>();
  const edgeIds = new Set<string>();

  for (const node of graph.nodes) {
    if (nodeIds.has(node.id)) {
      issues.push({
        code: 'duplicate_node',
        message: `Duplicate node id: ${node.id}`,
        entityId: node.id
      });
    }
    nodeIds.add(node.id);
  }

  for (const edge of graph.edges) {
    if (edgeIds.has(edge.id)) {
      issues.push({
        code: 'duplicate_edge',
        message: `Duplicate edge id: ${edge.id}`,
        entityId: edge.id
      });
    }
    edgeIds.add(edge.id);

    if (!nodeIds.has(edge.from) || !nodeIds.has(edge.to)) {
      issues.push({
        code: 'missing_node',
        message: `Edge ${edge.id} references a missing node`,
        entityId: edge.id
      });
    }

    if (edge.from === edge.to) {
      issues.push({
        code: 'self_loop',
        message: `Edge ${edge.id} forms a self loop`,
        entityId: edge.id
      });
    }

    if (edge.strength !== undefined && (edge.strength < 0 || edge.strength > 1)) {
      issues.push({
        code: 'invalid_strength',
        message: `Edge ${edge.id} strength must be between 0 and 1`,
        entityId: edge.id
      });
    }
  }

  return {
    valid: issues.length === 0,
    issues
  };
}

export function subgraph(
  graph: IdentityGraph,
  nodeIds: Iterable<string>
): IdentityGraph {
  const allowed = new Set(nodeIds);
  const nodes = graph.nodes.filter(node => allowed.has(node.id));
  const edges = graph.edges.filter(edge => allowed.has(edge.from) && allowed.has(edge.to));

  return {
    version: graph.version,
    updatedAt: graph.updatedAt,
    nodes,
    edges
  };
}
