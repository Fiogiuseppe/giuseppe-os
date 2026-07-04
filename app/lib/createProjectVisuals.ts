export type ProjectVisual = {
  src: string;
  alt: string;
  variant?: 'logo' | 'cover' | 'wordmark';
};

const PROJECT_VISUALS: Record<string, ProjectVisual> = {
  LEGO: {
    src: '/images/LEGO_logo.svg.webp',
    alt: 'LEGO',
    variant: 'logo'
  },
  'Visceral Poems': {
    src: '/images/VISCERAL-POETRY-126-scaled.jpg',
    alt: 'Visceral Poems',
    variant: 'cover'
  },
  UREES: {
    src: '/images/Urees_Logo_9afae6b4-d876-4082-8c40-869d133e917b.webp',
    alt: 'Urees',
    variant: 'wordmark'
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
