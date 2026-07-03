import brain from '../memory/giuseppe_brain.json';

export function purposeCheck(action: string) {
  return {
    action,
    northStar: brain.north_star,
    question: 'Questa azione mi avvicina o mi allontana dalla persona che voglio diventare?',
    filters: brain.values,
    rule: 'If it does not increase at least one capital, it needs to be redesigned.'
  };
}
