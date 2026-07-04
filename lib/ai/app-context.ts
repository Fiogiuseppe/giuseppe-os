import fs from 'node:fs';
import path from 'node:path';
import giuseppeBrain from '../../memory/giuseppe_brain.json';

const IDENTITY_PATH = path.join(process.cwd(), 'brain', 'GIUSEPPE_OS_IDENTITY.md');

export function loadGiuseppeIdentityPrompt(): string {
  return fs.readFileSync(IDENTITY_PATH, 'utf8').trim();
}

function activeProjects(): string[] {
  return Object.entries(giuseppeBrain.projects)
    .filter(([, project]) => project.status === 'active')
    .map(([name, project]) => `${name}: ${project.role}`);
}

export function buildAppContextBlock(): string {
  const priorities = 'priorities' in giuseppeBrain ? giuseppeBrain.priorities : [];
  const priorityLines = Array.isArray(priorities) ? priorities.slice(0, 6) : [];

  return [
    'CURRENT APP CONTEXT',
    `North Star: ${giuseppeBrain.north_star}`,
    `Mission 2036: ${giuseppeBrain.mission_2036}`,
    `Values: ${giuseppeBrain.values.join(', ')}`,
    `Rules: ${giuseppeBrain.rules.slice(0, 4).join('; ')}`,
    `Active projects: ${activeProjects().join(' | ')}`,
    priorityLines.length ? `Current priorities: ${priorityLines.join('; ')}` : null
  ]
    .filter(Boolean)
    .join('\n');
}

export function buildGiuseppeSystemPrompt(): string {
  return `${loadGiuseppeIdentityPrompt()}\n\n${buildAppContextBlock()}`;
}
