/**
 * Live Groq quality verification — prints RAW model output for manual review.
 * Uses lib/oracle/fixtures.ts only (no real Giuseppe data).
 *
 * Usage: npx tsx scripts/verify-groq-quality.ts
 * Requires: GROQ_API_KEY (or AIGROQ) and AI_PROVIDER=groq
 */

import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { getAIProvider, resetAIProviderCache } from '../lib/ai/orchestrator';
import { createCompletionProvider } from '../lib/ai/completionAdapter';
import { wrapProviderWithLogging } from '../lib/ai/loggedProvider';
import { completeWithJsonContract } from '../lib/ai/jsonCompletion';
import { generateDecisionAI } from '../lib/ai/decision-ai';
import { DAILY_BRIEFING_SYSTEM_PROMPT } from '../lib/todays-letter/prompt';
import { WEEKLY_BOARD_SYSTEM_PROMPT, formatWeeklyEvidencePrompt } from '../lib/oracle/weeklyPrompt';
import { formatEvidenceForPrompt } from '../lib/oracle/formatEvidence';
import { SAMPLE_ORACLE_EVIDENCE } from '../lib/oracle/fixtures';
import { buildContentSystemPrompt } from '../lib/content/rules';
import { buildFormatUserPrompt } from '../lib/content/prompts';
import { readGroqApiKey } from '../lib/ai/credentials';
import { CREATIVE_CONTENT_TEMPERATURE } from '../lib/ai/jsonCompletion';

function loadEnvLocal(): void {
  const envPath = resolve(process.cwd(), '.env.local');
  if (!existsSync(envPath)) {
    return;
  }

  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }
    const eq = trimmed.indexOf('=');
    if (eq <= 0) {
      continue;
    }
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

function section(title: string): void {
  console.log('\n' + '='.repeat(72));
  console.log(title);
  console.log('='.repeat(72));
}

async function verifyDecision(): Promise<void> {
  section('DECISION AI (lib/ai/decision-ai.ts)');
  const result = await generateDecisionAI({
    decision: 'Pubblicare un post su LinkedIn questa settimana',
    answers: {
      motivation: 'Mostrare come penso senza perdere tempo in perfezionismo.'
    },
    locale: 'it'
  });
  console.log(JSON.stringify(result, null, 2));
}

async function verifyTodaysLetter(): Promise<void> {
  section("TODAY'S LETTER (Daily Briefing JSON contract)");
  const provider = wrapProviderWithLogging(createCompletionProvider(), 'verify-todays-letter');
  const evidenceBlock = formatEvidenceForPrompt(SAMPLE_ORACLE_EVIDENCE);
  const userPrompt = [
    'Scrivi il Daily Briefing di Giuseppe usando solo questo contesto fixture:',
    'Rispondi interamente in italiano.',
    evidenceBlock
  ].join('\n\n');

  const completion = await completeWithJsonContract(provider, {
    system: DAILY_BRIEFING_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userPrompt }],
    maxTokens: 1000,
    expectJson: true
  });

  console.log('--- RAW MODEL OUTPUT ---');
  console.log(completion.content);
}

async function verifyWeeklyBoard(): Promise<void> {
  section('WEEKLY BOARD (JSON contract)');
  const provider = wrapProviderWithLogging(createCompletionProvider(), 'verify-weekly-board');
  const evidenceBlock = formatWeeklyEvidencePrompt(
    formatEvidenceForPrompt(SAMPLE_ORACLE_EVIDENCE),
    '2026-W27 (fixture)'
  );
  const userPrompt = [
    'Prepara il Weekly Board di Giuseppe usando solo questo contesto evidenza fixture:',
    'Rispondi interamente in italiano.',
    'NORTH STAR: PROGETTARE UNA VITA CHE MI RENDA LIBERO DI CREARE CIÒ CHE CONTA.',
    'MISSION: Costruire una persona che possa scegliere se lavorare oppure no.',
    evidenceBlock
  ].join('\n\n');

  const completion = await completeWithJsonContract(provider, {
    system: WEEKLY_BOARD_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userPrompt }],
    maxTokens: 900,
    expectJson: true
  });

  console.log('--- RAW MODEL OUTPUT ---');
  console.log(completion.content);
}

async function verifyContentGenerator(): Promise<void> {
  section('CONTENT GENERATOR — LinkedIn (creative prose, not JSON)');
  const provider = wrapProviderWithLogging(createCompletionProvider(), 'verify-content');
  const material = {
    sourceType: 'freeform' as const,
    title: 'Fixture insight: dispersione vs reputazione',
    summary: 'Decision dispersion vs weekly publishing discipline',
    body: 'Sample fixture: opening side projects without closing fronts weakened trajectory; weekly LinkedIn publishing created high-value conversations.',
    metadata: {
      topic: 'Decision dispersion vs weekly publishing discipline',
      sourceLabel: 'oracle-fixture',
      brainContext: 'North Star: freedom to create what matters. Active project: LEGO income engine.'
    }
  };

  const linkedin = await provider.complete({
    system: buildContentSystemPrompt(),
    messages: [{ role: 'user', content: buildFormatUserPrompt('linkedin', material) }],
    maxTokens: 700,
    temperature: CREATIVE_CONTENT_TEMPERATURE
  });

  console.log('--- RAW LINKEDIN OUTPUT ---');
  console.log(linkedin.content);

  section('CONTENT GENERATOR — Instagram story (JSON array contract)');
  const instagram = await completeWithJsonContract(provider, {
    system: buildContentSystemPrompt(),
    messages: [{ role: 'user', content: buildFormatUserPrompt('instagram-story', material) }],
    maxTokens: 500,
    expectJson: true
  });

  console.log('--- RAW INSTAGRAM OUTPUT ---');
  console.log(instagram.content);
}

async function main(): Promise<void> {
  loadEnvLocal();
  resetAIProviderCache();

  if (!readGroqApiKey()) {
    console.error('GROQ_API_KEY (or AIGROQ) is required. Set it in .env.local or the environment.');
    process.exit(1);
  }

  process.env.AI_PROVIDER = process.env.AI_PROVIDER ?? 'groq';

  const ai = getAIProvider();
  console.log(`Giuseppe OS — provider verification (${ai.name})`);
  console.log('Read the raw output below yourself — do not trust automated quality judgment.\n');

  await verifyDecision();
  await verifyTodaysLetter();
  await verifyWeeklyBoard();
  await verifyContentGenerator();

  console.log('\nDone. Review raw outputs above for JSON validity, evidence grounding, and voice.');
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
