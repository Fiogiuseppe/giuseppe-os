import type { BrainRequest } from './types';

const MISSION_ANCHORS = [
  'libert',
  'north star',
  '2036',
  'capitale',
  'concentraz',
  'verità',
  'creare',
  'mission'
];

export function evaluateMissionAlignment(request: BrainRequest, answer: string): boolean {
  const corpus = [
    request.message,
    request.decision,
    request.reason,
    answer
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  if (corpus.length < 12) {
    return false;
  }

  return MISSION_ANCHORS.some(anchor => corpus.includes(anchor));
}

export function missionGatePrompt(): string {
  return 'Will this response help Giuseppe become the person he chose to become?';
}
