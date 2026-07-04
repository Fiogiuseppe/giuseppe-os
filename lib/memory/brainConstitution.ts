import giuseppeBrain from '../../memory/giuseppe_brain.json';
import type { GiuseppeBrain } from '../brain/types';

export function loadBrainConstitution(): GiuseppeBrain {
  return giuseppeBrain as GiuseppeBrain;
}
