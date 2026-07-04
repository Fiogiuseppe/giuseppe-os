import type { IdentityEdgeKind, IdentityNodeKind } from './types';

export const IDENTITY_NODE_KINDS: readonly IdentityNodeKind[] = [
  'value',
  'principle',
  'long_term_goal',
  'project',
  'habit',
  'relationship',
  'decision',
  'lesson',
  'skill',
  'interest',
  'life_event',
  'pattern',
  'ambition'
] as const;

export const IDENTITY_EDGE_KINDS: readonly IdentityEdgeKind[] = [
  'supports',
  'derives_from',
  'reinforces',
  'contrasts',
  'contradicts',
  'enables',
  'blocks',
  'part_of',
  'leads_to',
  'relates_to'
] as const;

export const IDENTITY_NODE_KIND_LABELS: Record<IdentityNodeKind, string> = {
  value: 'Value',
  principle: 'Principle',
  long_term_goal: 'Long-term goal',
  project: 'Project',
  habit: 'Habit',
  relationship: 'Relationship',
  decision: 'Decision',
  lesson: 'Lesson',
  skill: 'Skill',
  interest: 'Interest',
  life_event: 'Life event',
  pattern: 'Pattern',
  ambition: 'Ambition'
};

export const IDENTITY_EDGE_KIND_LABELS: Record<IdentityEdgeKind, string> = {
  supports: 'Supports',
  derives_from: 'Derives from',
  reinforces: 'Reinforces',
  contrasts: 'Contrasts',
  contradicts: 'Contradicts',
  enables: 'Enables',
  blocks: 'Blocks',
  part_of: 'Part of',
  leads_to: 'Leads to',
  relates_to: 'Relates to'
};

export function isIdentityNodeKind(value: string): value is IdentityNodeKind {
  return (IDENTITY_NODE_KINDS as readonly string[]).includes(value);
}

export function isIdentityEdgeKind(value: string): value is IdentityEdgeKind {
  return (IDENTITY_EDGE_KINDS as readonly string[]).includes(value);
}
