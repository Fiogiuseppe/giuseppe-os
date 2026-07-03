import type { ContextSlice, ContextTopic, GiuseppeBrain } from '../types';
import { publicFinanceSnapshot } from '../memory/publicFinance';

function activeProjects(brain: GiuseppeBrain): string[] {
  return Object.entries(brain.projects)
    .filter(([, project]) => project.status === 'active' || project.status === 'slow-active')
    .map(([name, project]) => `${name}: ${project.role}`);
}

export function buildIdentitySlice(brain: GiuseppeBrain): ContextSlice {
  return {
    id: 'identity',
    topic: 'identity',
    label: 'Identity',
    content: [
      `North Star: ${brain.north_star}`,
      `Mission 2036: ${brain.mission_2036}`,
      `Manifesto: ${brain.manifesto}`,
      `Values: ${brain.values.join(', ')}`,
      `Rules: ${brain.rules.join(' | ')}`
    ].join('\n')
  };
}

export function buildFinanceSlice(brain: GiuseppeBrain): ContextSlice {
  const finance = publicFinanceSnapshot(brain);
  return {
    id: 'finance',
    topic: 'finance',
    label: 'Finance',
    content: [
      `Liquidity tier: ${finance.liquidityTier}`,
      `Goals: ${finance.goals.join(', ')}`,
      'Sensitive balances are redacted.'
    ].join('\n')
  };
}

export function buildFreedomSlice(brain: GiuseppeBrain): ContextSlice {
  return {
    id: 'freedom',
    topic: 'freedom',
    label: 'Freedom',
    content: [
      `Mission 2036: ${brain.mission_2036}`,
      `Priorities: ${brain.priorities.join(' | ')}`,
      `Patterns: ${brain.patterns.join(' | ')}`
    ].join('\n')
  };
}

export function buildProjectsSlice(brain: GiuseppeBrain, topics: ContextTopic[]): ContextSlice {
  const all = activeProjects(brain);
  const filtered = topics.includes('creative')
    ? all.filter(line => /visceral|urees|poem|brand/i.test(line))
    : topics.includes('reputation')
      ? all.filter(line => /medium|linkedin|lego|brand/i.test(line))
      : all;

  return {
    id: 'projects',
    topic: 'projects',
    label: 'Projects',
    content: filtered.join('\n')
  };
}

export function buildCreativeSlice(brain: GiuseppeBrain): ContextSlice {
  return {
    id: 'creative',
    topic: 'creative',
    label: 'Creative',
    content: [
      `Creative goals: ${brain.creative_goals.join(' | ')}`,
      ...Object.entries(brain.projects)
        .filter(([name]) => /visceral|urees|poem/i.test(name))
        .map(([name, project]) => `${name}: ${project.role}`)
    ].join('\n')
  };
}

export function buildReputationSlice(brain: GiuseppeBrain): ContextSlice {
  return {
    id: 'reputation',
    topic: 'reputation',
    label: 'Reputation',
    content: [
      `Career goals: ${brain.career_goals.join(' | ')}`,
      `Priorities: ${brain.priorities.join(' | ')}`,
      `Medium/LinkedIn: ${brain.projects['Medium/LinkedIn']?.role ?? 'n/a'}`
    ].join('\n')
  };
}

export function buildLearningSlice(brain: GiuseppeBrain): ContextSlice {
  return {
    id: 'learning',
    topic: 'learning',
    label: 'Learning',
    content: [
      `Skills: ${brain.skills.join(', ')}`,
      `Reading queue: ${brain.reading_queue.join(' | ')}`
    ].join('\n')
  };
}

export function buildPatternsSlice(brain: GiuseppeBrain): ContextSlice {
  return {
    id: 'patterns',
    topic: 'patterns',
    label: 'Patterns',
    content: brain.patterns.map(pattern => `- ${pattern}`).join('\n')
  };
}

export function buildTravelSlice(brain: GiuseppeBrain): ContextSlice {
  return {
    id: 'travel',
    topic: 'travel',
    label: 'Travel & roots',
    content: [
      'Giuseppe: Italy → Barcelona → Copenhagen.',
      `Freedom goals reference long-term roots and mobility.`,
      `Finance goals: ${brain.finance.main_goals.join(' | ')}`
    ].join('\n')
  };
}

export function buildRelationshipsSlice(brain: GiuseppeBrain): ContextSlice {
  return {
    id: 'relationships',
    topic: 'relationships',
    label: 'Relationships',
    content: `Contacts to nurture: ${brain.contacts.join(' | ')}`
  };
}

export function selectSlices(brain: GiuseppeBrain, topics: ContextTopic[]): ContextSlice[] {
  const slices: ContextSlice[] = [buildIdentitySlice(brain)];
  const picked = new Set<ContextTopic>();

  for (const topic of topics) {
    if (picked.has(topic)) continue;
    picked.add(topic);

    switch (topic) {
      case 'finance':
        slices.push(buildFinanceSlice(brain));
        break;
      case 'freedom':
        slices.push(buildFreedomSlice(brain));
        break;
      case 'projects':
        slices.push(buildProjectsSlice(brain, topics));
        break;
      case 'creative':
        slices.push(buildCreativeSlice(brain));
        break;
      case 'reputation':
        slices.push(buildReputationSlice(brain));
        break;
      case 'learning':
        slices.push(buildLearningSlice(brain));
        break;
      case 'patterns':
        slices.push(buildPatternsSlice(brain));
        break;
      case 'travel':
        slices.push(buildTravelSlice(brain));
        break;
      case 'relationships':
        slices.push(buildRelationshipsSlice(brain));
        break;
      default:
        break;
    }
  }

  return slices;
}
