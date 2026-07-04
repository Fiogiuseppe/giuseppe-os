import fs from 'node:fs';
import path from 'node:path';
import giuseppeBrain from '../../memory/giuseppe_brain.json';

const IDENTITY_PATH = path.join(process.cwd(), 'brain', 'GIUSEPPE_OS_IDENTITY.md');

export function loadGiuseppeIdentityPrompt(): string {
  return fs.readFileSync(IDENTITY_PATH, 'utf8').trim();
}

export function buildChatSystemPrompt(): string {
  const identity = loadGiuseppeIdentityPrompt();
  const context = [
    'CURRENT APP CONTEXT',
    `North Star: ${giuseppeBrain.north_star}`,
    `Mission 2036: ${giuseppeBrain.mission_2036}`,
    `Active priorities: ${giuseppeBrain.priorities.slice(0, 4).join('; ')}`
  ].join('\n');

  return `${identity}\n\n${context}`;
}
