import { runDecisionEngine } from '../../engine/decisionEngine';
import { buildGiuseppeSystemPrompt } from './app-context';
import { runWithAICallMeta } from './callContext';
import { isAIMockMode } from './mode';
import { completeJsonWithProviderChain } from './jsonProviderChain';
import { assembleDecisionAIResult } from '../brain/decisions/assemble';
import type { DecisionAIResult, DecisionResponseSource } from '../brain/decisions/types';
import { compileDecisionContext } from '../brain/decisions/intake';
import { parseDecisionFieldsFromAnswer } from '../brain/decisions/parse';
import { assessEvidence } from '../memory/evidence';
import { buildEvidenceSnapshot } from '../memory/insights';
import { loadLongTermMemory, loadWorkingMemory } from '../brain/memory/store';
import { resolveLocale, pickLocale, type AppLocale } from '../i18n/locale';

export type DecisionAIInput = {
  decision: string;
  answers?: Record<string, string>;
  locale?: AppLocale;
};

export type DecisionAIOutput = {
  decision: DecisionAIResult;
  provider?: string;
};

function buildDecisionPrompt(params: {
  decision: string;
  reason: string;
  engineSummary: string;
  locale: AppLocale;
}): string {
  const language = params.locale === 'en' ? 'English' : 'Italian';

  return [
    'You are Giuseppe OS Decision AI — a private decision partner, not a chatbot.',
    'Analyze the decision below and respond with JSON only (no markdown fences).',
    '',
    'Required JSON keys:',
    '- recommendation (string)',
    '- risks (string array, 2-4 items)',
    '- emotionalBiasCheck (string — name the likely emotional bias and how to counter it)',
    '- alignment (string — how this aligns or conflicts with Giuseppe OS identity and values)',
    '- nextAction (string — one concrete next step within 48 hours)',
    '- missingInformation (string array — what Giuseppe still needs to decide well)',
    '- whyItMatters (string)',
    '- hiddenNeed (string)',
    '- bias (string)',
    '- boardPerspective (string — brief synthesis from CEO2036, CFO, Strategist, Creative Director, Psychologist, Mentor)',
    '- confidenceScore (number 0-100)',
    '- categoryLabel (string)',
    '- betterVersion (string)',
    '',
    `Write all string values in ${language}.`,
    '',
    `DECISION: ${params.decision}`,
    `CONTEXT FROM INTAKE: ${params.reason || 'No additional context yet.'}`,
    '',
    'RULE-BASED ENGINE BASELINE (use as grounding, improve with judgment):',
    params.engineSummary
  ].join('\n');
}

function summarizeEngineForPrompt(engine: ReturnType<typeof runDecisionEngine>): string {
  return [
    `Category: ${engine.categoryLabel}`,
    `Hidden need: ${engine.hiddenNeed}`,
    `Bias: ${engine.bias}`,
    `Better version: ${engine.betterVersion}`,
    `Next action (engine): ${engine.nextAction}`,
    `Board: ${Object.entries(engine.counsellors)
      .map(([role, text]) => `${role}: ${text}`)
      .join(' | ')}`
  ].join('\n');
}

function stripDecisionAnswerJson(answer: string): string {
  const trimmed = answer.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  return fenced?.[1]?.trim() ?? trimmed;
}

function isDecisionJsonParseable(answer: string): boolean {
  if (!answer.trim()) {
    return false;
  }

  try {
    const json = JSON.parse(stripDecisionAnswerJson(answer)) as unknown;
    return json !== null && typeof json === 'object' && !Array.isArray(json);
  } catch {
    return false;
  }
}

function mergeExtendedFields(
  base: DecisionAIResult,
  parsed: ReturnType<typeof parseDecisionFieldsFromAnswer> & {
    risks?: string[];
    emotionalBiasCheck?: string;
    alignment?: string;
    missingInformation?: string[];
  }
): DecisionAIResult {
  return {
    ...base,
    risks: parsed.risks?.length ? parsed.risks : base.risks,
    emotionalBiasCheck: parsed.emotionalBiasCheck ?? base.emotionalBiasCheck,
    alignment: parsed.alignment ?? base.alignment,
    missingInformation: parsed.missingInformation?.length
      ? parsed.missingInformation
      : base.missingInformation
  };
}

function parseExtendedDecisionFields(answer: string) {
  const parsed = parseDecisionFieldsFromAnswer(answer) as ReturnType<
    typeof parseDecisionFieldsFromAnswer
  > & {
    risks?: string[];
    emotionalBiasCheck?: string;
    alignment?: string;
    missingInformation?: string[];
  };

  if (!isDecisionJsonParseable(answer)) {
    return parsed;
  }

  const json = JSON.parse(stripDecisionAnswerJson(answer)) as Record<string, unknown>;
  if (Array.isArray(json.risks)) {
    parsed.risks = json.risks.filter(item => typeof item === 'string') as string[];
  }
  if (typeof json.emotionalBiasCheck === 'string') {
    parsed.emotionalBiasCheck = json.emotionalBiasCheck;
  }
  if (typeof json.alignment === 'string') {
    parsed.alignment = json.alignment;
  }
  if (Array.isArray(json.missingInformation)) {
    parsed.missingInformation = json.missingInformation.filter(
      item => typeof item === 'string'
    ) as string[];
  }

  return parsed;
}

export async function generateDecisionAI(input: DecisionAIInput): Promise<DecisionAIOutput> {
  const locale = resolveLocale(input.locale);
  const reason = compileDecisionContext(input.decision, input.answers ?? {});
  const engine = runDecisionEngine({ decision: input.decision, reason, locale });

  const [longTerm, working] = await Promise.all([loadLongTermMemory(), loadWorkingMemory()]);
  const evidenceAssessment = assessEvidence(buildEvidenceSnapshot(longTerm, working));

  if (isAIMockMode()) {
    const assembled = assembleDecisionAIResult({
      engine,
      answer: '',
      confidence: 0,
      evidenceAssessment,
      source: 'engine',
      locale
    });

    return {
      decision: {
        ...assembled,
        confidenceScore: null,
        confidenceLabel: 'notEnoughData',
        risks: [
          pickLocale(
            locale,
            'Decisione presa con poco contesto — il rischio principale è agire troppo presto.',
            'Decision taken with little context — the main risk is acting too soon.'
          )
        ],
        emotionalBiasCheck: engine.bias,
        alignment: pickLocale(
          locale,
          `Allineamento da verificare rispetto alla North Star: ${engine.betterVersion}`,
          `Alignment to verify against North Star: ${engine.betterVersion}`
        ),
        missingInformation: [
          pickLocale(
            locale,
            'Cosa succede se non fai nulla per 30 giorni?',
            'What happens if you do nothing for 30 days?'
          )
        ]
      }
    };
  }

  const system = buildGiuseppeSystemPrompt();
  const userPrompt = buildDecisionPrompt({
    decision: input.decision,
    reason,
    engineSummary: summarizeEngineForPrompt(engine),
    locale
  });

  const completion = await runWithAICallMeta(
    { page: 'decisions', reason: 'decision-recommend' },
    () =>
      completeJsonWithProviderChain(
        {
          system,
          messages: [{ role: 'user', content: userPrompt }],
          maxTokens: 1400,
          expectJson: true
        },
        { route: 'decision-ai', page: 'decisions', reason: 'decision-recommend' }
      )
  );

  const answer = completion.content;
  const provider = completion.provider;
  const aiJsonValid = isDecisionJsonParseable(answer);
  const source: DecisionResponseSource = aiJsonValid ? 'ai' : 'engine';
  const parsed = parseExtendedDecisionFields(answer);
  const assembled = assembleDecisionAIResult({
    engine,
    answer,
    confidence: aiJsonValid ? (parsed.confidenceScore ?? 60) : 0,
    evidenceAssessment,
    source,
    locale
  });

  const decision = mergeExtendedFields(assembled, parsed);

  if (!aiJsonValid) {
    return {
      decision: {
        ...decision,
        confidenceScore: null,
        confidenceLabel: 'notEnoughData',
        source: 'engine'
      },
      provider
    };
  }

  return { decision, provider };
}
