import { IDENTITY_EDGE_KIND_LABELS } from './schema';
import type { IdentityQueryResult } from './types';

export function formatIdentityGraphForBrain(result: IdentityQueryResult): string {
  if (result.nodes.length === 0) {
    return 'IDENTITY GRAPH\n(empty — no nodes materialized yet)';
  }

  const nodeLines = result.nodes.map(
    node => `- [${node.kind}] ${node.label}${node.description ? ` — ${node.description}` : ''}`
  );

  const edgeLines = result.edges.map(edge => {
    const from = result.nodes.find(node => node.id === edge.from)?.label ?? edge.from;
    const to = result.nodes.find(node => node.id === edge.to)?.label ?? edge.to;
    const kind = IDENTITY_EDGE_KIND_LABELS[edge.kind];
    return `- ${from} → ${to} (${kind})`;
  });

  const pathLines =
    result.paths?.map(path => {
      const labels = path.map(
        nodeId => result.nodes.find(node => node.id === nodeId)?.label ?? nodeId
      );
      return `- ${labels.join(' → ')}`;
    }) ?? [];

  return [
    'IDENTITY GRAPH',
    'Nodes:',
    ...nodeLines,
    edgeLines.length > 0 ? 'Relationships:' : undefined,
    ...edgeLines,
    pathLines.length > 0 ? 'Paths:' : undefined,
    ...pathLines
  ]
    .filter((line): line is string => Boolean(line))
    .join('\n');
}

export function formatIdentityGraphSummary(nodeCount: number, edgeCount: number): string {
  if (nodeCount === 0) {
    return 'Identity graph is initialized but not yet populated.';
  }

  return `Identity graph contains ${nodeCount} nodes and ${edgeCount} relationships.`;
}
