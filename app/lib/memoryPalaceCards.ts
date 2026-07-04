import type brain from '../../memory/giuseppe_brain.json';

export type MemoryPalaceCard = {
  label: string;
  text: string;
  accent?: boolean;
};

type GiuseppeBrain = typeof brain;

export function buildMemoryPalaceCards(data: GiuseppeBrain): MemoryPalaceCard[] {
  const activeProjects = Object.entries(data.projects)
    .filter(([, project]) => project.status === 'active' || project.status === 'slow-active')
    .map(([name, project]) => `${name}: ${project.role}`)
    .join(' ');

  return [
    { label: 'MISSION', text: data.mission_2036 },
    { label: 'NORTH STAR', text: data.north_star, accent: true },
    { label: 'LIFE VISION', text: data.manifesto },
    { label: 'VALUES', text: data.values.join(' · ') },
    { label: 'PRINCIPLES', text: data.rules.join(' ') },
    { label: 'DECISION RULES', text: data.rules.filter(rule => rule.includes('decisione') || rule.includes('capitale')).join(' ') || data.rules[2] },
    { label: 'FUTURE SELF', text: data.mission_2036 },
    { label: 'CREATIVE DNA', text: data.creative_goals.join(' ') },
    { label: 'LESSONS', text: data.patterns.slice(0, 2).join(' ') },
    { label: 'BLIND SPOTS', text: data.patterns.slice(2).join(' '), accent: true },
    { label: 'PROJECTS', text: activeProjects },
    { label: 'PRIORITIES', text: data.priorities.join(' ') }
  ];
}
