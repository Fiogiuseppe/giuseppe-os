import type { ContextTopic } from '../brain/types';
import { formatIdentityGraphSummary } from './brainContext';
import { identityGraphProvider } from './provider';
import type { IdentityEdge, IdentityNode, IdentityNodeKind } from './types';

const TOPIC_TO_NODE_KINDS: Partial<Record<ContextTopic, IdentityNodeKind[]>> = {
  identity: ['value', 'principle', 'ambition', 'pattern'],
  projects: ['project', 'habit', 'skill'],
  creative: ['interest', 'project', 'skill'],
  reputation: ['ambition', 'project', 'relationship'],
  relationships: ['relationship', 'life_event'],
  patterns: ['pattern', 'lesson', 'habit'],
  learning: ['lesson', 'skill', 'interest'],
  finance: ['long_term_goal', 'decision'],
  freedom: ['value', 'long_term_goal', 'ambition'],
  travel: ['life_event', 'interest']
};

/**
 * Resolve a compact identity graph context for the Executive Brain.
 * Returns an honest empty summary until the graph is populated.
 */
export async function resolveIdentityContextForBrain(
  topics: ContextTopic[] = []
): Promise<string> {
  const graph = await identityGraphProvider.getGraph();

  if (graph.nodes.length === 0) {
    return `IDENTITY GRAPH\n${formatIdentityGraphSummary(0, 0)}`;
  }

  const kinds = new Set<IdentityNodeKind>();
  for (const topic of topics) {
    const mapped = TOPIC_TO_NODE_KINDS[topic];
    if (mapped) {
      for (const kind of mapped) {
        kinds.add(kind);
      }
    }
  }

  if (kinds.size === 0) {
    return `IDENTITY GRAPH\n${formatIdentityGraphSummary(graph.nodes.length, graph.edges.length)}`;
  }

  const nodes = graph.nodes.filter((node: IdentityNode) => kinds.has(node.kind));
  const nodeIds = new Set(nodes.map((node: IdentityNode) => node.id));
  const edges = graph.edges.filter(
    (edge: IdentityEdge) => nodeIds.has(edge.from) && nodeIds.has(edge.to)
  );

  return identityGraphProvider.formatForBrain({
    query: { type: 'kind', kind: nodes[0]?.kind ?? 'value' },
    nodes,
    edges
  });
}
