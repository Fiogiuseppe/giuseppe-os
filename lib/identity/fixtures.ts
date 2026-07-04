import { createEmptyIdentityGraph } from './graph';
import type { IdentityGraph } from './types';

/**
 * Canonical example chain for documentation and future seeding tests.
 * Not loaded automatically — reference only.
 *
 * Writing → Visceral Poems → LinkedIn → Personal Brand → LEGO → Career
 */
export const EXAMPLE_IDENTITY_CHAIN_LABELS = [
  'Writing',
  'Visceral Poems',
  'LinkedIn',
  'Personal Brand',
  'LEGO',
  'Career'
] as const;

export function buildExampleIdentityChainGraph(now = new Date()): IdentityGraph {
  const timestamp = now.toISOString();
  const graph = createEmptyIdentityGraph(now);

  const nodeSpecs = [
    { id: 'interest-writing', kind: 'interest' as const, label: 'Writing' },
    { id: 'project-visceral-poems', kind: 'project' as const, label: 'Visceral Poems' },
    { id: 'project-linkedin', kind: 'project' as const, label: 'LinkedIn' },
    { id: 'ambition-personal-brand', kind: 'ambition' as const, label: 'Personal Brand' },
    { id: 'project-lego', kind: 'project' as const, label: 'LEGO' },
    { id: 'long-term-goal-career', kind: 'long_term_goal' as const, label: 'Career' }
  ];

  graph.nodes = nodeSpecs.map((spec, index) => ({
    id: spec.id,
    kind: spec.kind,
    label: spec.label,
    status: 'active',
    createdAt: timestamp,
    updatedAt: timestamp,
    metadata: { example: true, order: index }
  }));

  const pairs = [
    ['interest-writing', 'project-visceral-poems'],
    ['project-visceral-poems', 'project-linkedin'],
    ['project-linkedin', 'ambition-personal-brand'],
    ['ambition-personal-brand', 'project-lego'],
    ['project-lego', 'long-term-goal-career']
  ] as const;

  graph.edges = pairs.map(([from, to], index) => ({
    id: `example-edge-${index + 1}`,
    from,
    to,
    kind: 'leads_to' as const,
    createdAt: timestamp,
    updatedAt: timestamp,
    note: 'Example trajectory chain'
  }));

  return graph;
}
