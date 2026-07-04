import type brain from '../../memory/giuseppe_brain.json';

export type MemoryConstitution = {
  why: string;
  how: string[];
};

type GiuseppeBrain = typeof brain;

export function buildMemoryConstitution(data: GiuseppeBrain): MemoryConstitution {
  return {
    why: data.constitution.why,
    how: data.constitution.how
  };
}
