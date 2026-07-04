export type ProjectVisual = {
  src: string;
  alt: string;
};

const PROJECT_VISUALS: Record<string, ProjectVisual> = {
  LEGO: {
    src: '/images/projects/lego.svg',
    alt: 'LEGO'
  },
  'Visceral Poems': {
    src: '/images/projects/visceral-poems.svg',
    alt: 'Visceral Poems manifesto'
  },
  UREES: {
    src: '/images/projects/urees.svg',
    alt: 'UREES'
  },
  'Brand Giuseppe': {
    src: '/images/giuseppe-logo.png',
    alt: 'Brand Giuseppe'
  },
  'Medium/LinkedIn': {
    src: '/images/projects/medium-linkedin.svg',
    alt: 'Medium and LinkedIn'
  },
  Freelance: {
    src: '/images/projects/freelance.svg',
    alt: 'Freelance'
  }
};

export const CREATE_FEATURED_PROJECTS = ['LEGO', 'Visceral Poems', 'UREES', 'Brand Giuseppe'] as const;

export function getProjectVisual(name: string): ProjectVisual {
  return (
    PROJECT_VISUALS[name] ?? {
      src: '/images/projects/brand-giuseppe.svg',
      alt: name
    }
  );
}
