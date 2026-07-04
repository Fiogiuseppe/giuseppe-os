import type brain from '../../memory/giuseppe_brain.json';

export type ManifestoSection = {
  id: string;
  label: string;
  lines: string[];
  accent?: boolean;
};

type GiuseppeBrain = typeof brain;

function activeProjects(data: GiuseppeBrain): string[] {
  return Object.entries(data.projects)
    .filter(([, project]) => project.status === 'active' || project.status === 'slow-active')
    .map(([name, project]) => `${name} — ${project.role}`);
}

export function buildManifestoPrimarySections(data: GiuseppeBrain): ManifestoSection[] {
  return [
    {
      id: 'mission',
      label: 'MISSION',
      lines: [data.mission_2036]
    },
    {
      id: 'north-star',
      label: 'NORTH STAR',
      lines: [data.north_star],
      accent: true
    },
    {
      id: 'values',
      label: 'VALUES',
      lines: data.values
    },
    {
      id: 'principles',
      label: 'PRINCIPLES',
      lines: data.rules
    },
    {
      id: 'projects',
      label: 'PROJECTS',
      lines: activeProjects(data)
    },
    {
      id: 'priorities',
      label: 'PRIORITIES',
      lines: data.priorities
    }
  ];
}

export function buildManifestoDepthSections(data: GiuseppeBrain): ManifestoSection[] {
  const decisionRules =
    data.rules.filter(rule => rule.includes('decisione') || rule.includes('capitale')).length > 0
      ? data.rules.filter(rule => rule.includes('decisione') || rule.includes('capitale'))
      : [data.rules[2]];

  return [
    {
      id: 'life-vision',
      label: 'LIFE VISION',
      lines: [data.manifesto]
    },
    {
      id: 'decision-rules',
      label: 'DECISION RULES',
      lines: decisionRules
    },
    {
      id: 'future-self',
      label: 'FUTURE SELF',
      lines: [data.mission_2036]
    },
    {
      id: 'creative-dna',
      label: 'CREATIVE DNA',
      lines: data.creative_goals
    },
    {
      id: 'lessons',
      label: 'LESSONS',
      lines: data.patterns.slice(0, 2)
    },
    {
      id: 'blind-spots',
      label: 'BLIND SPOTS',
      lines: data.patterns.slice(2),
      accent: true
    }
  ];
}
