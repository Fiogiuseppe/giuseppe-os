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
    { label: 'IDENTITY', text: data.manifesto },
    { label: 'MISSION', text: data.mission_2036 },
    { label: 'NORTH STAR', text: data.north_star },
    { label: 'VALUES', text: data.values.join(' · ') },
    { label: 'RULES', text: data.rules.join(' ') },
    { label: 'PROJECTS', text: activeProjects },
    { label: 'RELATIONSHIPS', text: data.contacts.join(' ') },
    { label: 'PATTERNS', text: data.patterns.join(' '), accent: true },
    { label: 'LEARNING', text: [...data.reading_queue, ...data.skills].join(' ') },
    { label: 'PRIORITIES', text: data.priorities.join(' ') }
  ];
}
