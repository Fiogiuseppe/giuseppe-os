import type { BrainRequest, ContextPacket, ContextSource, GiuseppeBrain, WorkingMemory } from '../types';
import { publicFinanceSnapshot } from '../memory/publicFinance';

function nowIso(): string {
  return new Date().toISOString();
}

function activeProjects(brain: GiuseppeBrain): string[] {
  return Object.entries(brain.projects)
    .filter(([, project]) => project.status === 'active' || project.status === 'slow-active')
    .map(([name, project]) => `${name} (${project.role})`);
}

function buildSources(brain: GiuseppeBrain): ContextSource[] {
  const observedAt = nowIso();
  return [
    { field: 'north_star', sourceType: 'identity', reliability: 'high', observedAt },
    { field: 'mission_2036', sourceType: 'identity', reliability: 'high', observedAt },
    { field: 'manifesto', sourceType: 'identity', reliability: 'high', observedAt },
    { field: 'values', sourceType: 'identity', reliability: 'high', observedAt },
    { field: 'projects', sourceType: 'memory', reliability: 'high', observedAt },
    { field: 'patterns', sourceType: 'memory', reliability: 'medium', observedAt },
    { field: 'priorities', sourceType: 'memory', reliability: 'medium', observedAt },
    { field: 'finance', sourceType: 'memory', reliability: 'medium', observedAt },
    { field: 'rules', sourceType: 'memory', reliability: 'high', observedAt },
    { field: 'skills', sourceType: 'memory', reliability: 'medium', observedAt }
  ];
}

function buildSystemPrompt(brain: GiuseppeBrain, workingMemory: WorkingMemory): string {
  const finance = publicFinanceSnapshot(brain);
  const recentSessions = workingMemory.sessions
    .slice(-3)
    .map(session => `- [${session.intent}] ${session.summary}`)
    .join('\n');

  return [
    'You are the Executive Brain of Giuseppe OS.',
    'You help Giuseppe live his spiritual purpose inside practical reality.',
    'Speak with calm intelligence. Be direct, warm, and timeless.',
    'Never sound like a generic SaaS assistant or motivational chatbot.',
    'Always ground answers in Giuseppe-specific memory when relevant.',
    'End with one concrete next action when appropriate.',
    '',
    'IDENTITY',
    `North Star: ${brain.north_star}`,
    `Mission 2036: ${brain.mission_2036}`,
    `Manifesto: ${brain.manifesto}`,
    `Values: ${brain.values.join(', ')}`,
    '',
    'RULES',
    brain.rules.map(rule => `- ${rule}`).join('\n'),
    '',
    'ACTIVE PROJECTS',
    activeProjects(brain).map(project => `- ${project}`).join('\n'),
    '',
    'PRIORITIES',
    brain.priorities.map(item => `- ${item}`).join('\n'),
    '',
    'PATTERNS',
    brain.patterns.map(pattern => `- ${pattern}`).join('\n'),
    '',
    'FINANCE (privacy-safe snapshot)',
    `Liquidity tier: ${finance.liquidityTier}`,
    `Goals: ${finance.goals.join(', ')}`,
    '',
    'RECENT SESSIONS',
    recentSessions || '- none',
    '',
    'RESPONSE FORMAT',
    'Write in clear prose. Use short paragraphs.',
    'If you infer something not in memory, label it as inference.',
    'Prefer Italian when Giuseppe writes in Italian.'
  ].join('\n');
}

function buildUserPrompt(request: BrainRequest): string {
  if (request.intent === 'decide') {
    const decision = request.decision?.trim() || request.message.trim();
    const reason = request.reason?.trim() || '';
    return [
      'Giuseppe is facing a decision.',
      `Decision: ${decision}`,
      reason ? `Reason: ${reason}` : 'Reason: not provided',
      '',
      'Classify the decision, surface hidden needs and biases,',
      'debate from multiple counsellor perspectives,',
      'and return a better version plus one next action.'
    ].join('\n');
  }

  if (request.intent === 'reflect') {
    return [
      'Giuseppe wants reflection grounded in memory and patterns.',
      request.message.trim(),
      '',
      'Name what matters, what might be drifting, and one disciplined next move.'
    ].join('\n');
  }

  return [
    'Giuseppe asked:',
    request.message.trim(),
    '',
    'Answer as his personal operating system — not as a dashboard.'
  ].join('\n');
}

export function buildContext(
  request: BrainRequest,
  brain: GiuseppeBrain,
  workingMemory: WorkingMemory
): ContextPacket {
  const message = request.message?.trim() ?? '';
  const lowContext = message.length === 0 && request.intent !== 'decide';

  return {
    intent: request.intent,
    assembledAt: nowIso(),
    systemPrompt: buildSystemPrompt(brain, workingMemory),
    userPrompt: buildUserPrompt(request),
    sources: buildSources(brain),
    lowContext,
    identity: {
      northStar: brain.north_star,
      mission2036: brain.mission_2036,
      manifesto: brain.manifesto,
      values: brain.values
    },
    situational: {
      activeProjects: activeProjects(brain),
      priorities: brain.priorities,
      patterns: brain.patterns
    }
  };
}
