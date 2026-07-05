import type { BrainRequest, ContextPacket, ContextSource, GiuseppeBrain, WorkingMemory } from '../types';
import { buildDecideJsonInstruction } from '../decisions/prompt';
import { detectTopics } from '../intent/detectIntent';
import { selectSlices } from './slices';
import { resolveLocale, pickLocale } from '../../i18n/locale';

function nowIso(): string {
  return new Date().toISOString();
}

function buildSources(slices: ReturnType<typeof selectSlices>): ContextSource[] {
  const observedAt = nowIso();
  return slices.map(slice => ({
    field: slice.id,
    sourceType: slice.topic === 'identity' ? 'identity' : 'memory',
    reliability: slice.topic === 'identity' ? 'high' : 'medium',
    observedAt
  }));
}

function buildSystemPrompt(
  slices: ReturnType<typeof selectSlices>,
  workingMemory: WorkingMemory,
  intent: BrainRequest['intent'],
  locale: ReturnType<typeof resolveLocale>
): string {
  const recentSessions = workingMemory.sessions
    .slice(-3)
    .map(session => `- [${session.intent}] ${session.summary}`)
    .join('\n');

  const sliceBlock = slices
    .map(slice => `## ${slice.label}\n${slice.content}`)
    .join('\n\n');

  return [
    'You are the Executive Brain of Giuseppe OS.',
    'You are NOT a chatbot. You are a personal intelligence operating system.',
    'Before answering, ask: "Will this help Giuseppe become the person he chose to become?"',
    'Speak with calm intelligence. Be direct, warm, and timeless.',
    'Never sound like generic SaaS, crypto UI, or motivational filler.',
    'Use only the context slices below. Do not invent Giuseppe-specific facts.',
    'Label inferences clearly. End with one concrete next action when appropriate.',
    '',
    'RELEVANT MEMORY SLICES',
    sliceBlock,
    '',
    'RECENT SESSIONS',
    recentSessions || '- none',
    '',
    'RESPONSE FORMAT',
    intent === 'decide'
      ? `${buildDecideJsonInstruction(locale)} ${pickLocale(locale, 'Tutti i campi testuali in italiano.', 'All text fields in English.')}`
      : pickLocale(
          locale,
          'Rispondi interamente in italiano. Non mescolare lingue.',
          'Respond entirely in English. Do not mix languages.'
        ),
  ].join('\n');
}

function buildUserPrompt(request: BrainRequest, engineContext?: string): string {
  const engineBlock = engineContext
    ? `\n\nENGINE SIGNALS (merge, do not repeat blindly):\n${engineContext}`
    : '';

  if (request.intent === 'decide') {
    const decision = request.decision?.trim() || request.message.trim();
    const reason = request.reason?.trim() || '';
    return [
      'Giuseppe is facing a decision.',
      `Decision: ${decision}`,
      reason ? `Reason: ${reason}` : 'Reason: not provided',
      '',
      'Classify, surface hidden needs and biases, debate from counsellor angles,',
      'return a better version plus one next action.',
      engineBlock
    ].join('\n');
  }

  if (request.intent === 'reflect') {
    return [
      'Giuseppe wants reflection grounded in memory and patterns.',
      request.message.trim(),
      engineBlock
    ].join('\n');
  }

  if (request.intent === 'awareness') {
    return [
      'Proactive awareness scan. Open with "I noticed something." energy.',
      request.message.trim() || 'Scan memory for patterns, contradictions, opportunities, and risks.',
      engineBlock
    ].join('\n');
  }

  if (request.intent === 'potential') {
    return [
      'Surface the highest-alignment opportunity for Giuseppe right now.',
      request.message.trim() || 'What should Giuseppe focus on today?',
      engineBlock
    ].join('\n');
  }

  if (request.intent === 'learn') {
    return [
      'Analyze memory for lessons, recurring mistakes, and growth opportunities.',
      request.message.trim() || 'What is Giuseppe learning about himself?',
      engineBlock
    ].join('\n');
  }

  return [
    'Giuseppe asked:',
    request.message.trim(),
    engineBlock
  ].join('\n');
}

export function buildContext(
  request: BrainRequest,
  brain: GiuseppeBrain,
  workingMemory: WorkingMemory,
  engineContext?: string
): ContextPacket {
  const message = [request.message, request.decision, request.reason].filter(Boolean).join(' ');
  const locale = resolveLocale(request.locale);
  const topics = detectTopics(message);
  const slices = selectSlices(brain, topics);
  const lowContext = message.trim().length === 0 && request.intent !== 'decide';

  return {
    intent: request.intent,
    locale,
    assembledAt: nowIso(),
    systemPrompt: buildSystemPrompt(slices, workingMemory, request.intent, locale),
    userPrompt: buildUserPrompt(request, engineContext),
    sources: buildSources(slices),
    slices,
    topics,
    lowContext,
    identity: {
      northStar: brain.north_star,
      mission2036: brain.mission_2036,
      manifesto: brain.manifesto,
      values: brain.values
    },
    situational: {
      activeProjects: Object.entries(brain.projects)
        .filter(([, p]) => p.status === 'active' || p.status === 'slow-active')
        .map(([name]) => name),
      priorities: brain.priorities,
      patterns: brain.patterns
    }
  };
}
