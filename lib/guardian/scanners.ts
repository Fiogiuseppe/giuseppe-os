import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PRODUCT_SECTIONS } from '../architecture/sections';
import { GUARDIAN_SECTION_QUESTIONS } from './constitution';
import type { GuardianFinding } from './types';

const ROOT = path.join(fileURLToPath(new URL('.', import.meta.url)), '..', '..');

function read(relativePath: string): string {
  const full = path.join(ROOT, relativePath);
  if (!fs.existsSync(full)) {
    return '';
  }
  return fs.readFileSync(full, 'utf8');
}

function fileExists(relativePath: string): boolean {
  return fs.existsSync(path.join(ROOT, relativePath));
}

function grepFiles(
  pattern: RegExp,
  globs: string[],
  options?: {
    category?: GuardianFinding['category'];
    severity?: GuardianFinding['severity'];
    title?: string;
    why?: string;
    recommendation?: string;
  }
): GuardianFinding[] {
  const findings: GuardianFinding[] = [];

  for (const relativePath of globs) {
    const content = read(relativePath);
    if (!content || !pattern.test(content)) {
      continue;
    }

    findings.push({
      id: `grep:${relativePath}:${pattern.source}`,
      category: options?.category ?? 'ai-consistency',
      severity: options?.severity ?? 'medium',
      title: options?.title ?? `Pattern detected: ${pattern.source}`,
      detail: `Matched in ${relativePath}.`,
      why:
        options?.why ??
        'The Guardian flags patterns that can erode trust or introduce fake certainty.',
      recommendation:
        options?.recommendation ??
        'Review this usage and ensure evidence, uncertainty, or silence is explicit.',
      file: relativePath
    });
  }

  return findings;
}

function requirePattern(
  relativePath: string,
  pattern: RegExp,
  finding: Omit<GuardianFinding, 'id'> & { id: string }
): GuardianFinding | null {
  const content = read(relativePath);
  if (!content) {
    return {
      ...finding,
      detail: `${relativePath} was not found.`,
      file: relativePath
    };
  }

  if (!pattern.test(content)) {
    return {
      ...finding,
      detail: finding.detail || `Expected pattern missing in ${relativePath}.`,
      file: relativePath
    };
  }

  return null;
}

function dedupeFindings(findings: GuardianFinding[]): GuardianFinding[] {
  const seen = new Set<string>();
  return findings.filter(finding => {
    if (seen.has(finding.id)) {
      return false;
    }
    seen.add(finding.id);
    return true;
  });
}

export function scanGuardianPresence(): GuardianFinding[] {
  const findings: GuardianFinding[] = [];

  if (!fileExists('agents/The_Guardian.md')) {
    findings.push({
      id: 'guardian:missing-agent',
      category: 'philosophy',
      severity: 'critical',
      title: 'The Guardian agent definition is missing',
      detail: 'agents/The_Guardian.md was not found.',
      why: 'Without The Guardian, product drift has no internal protector.',
      recommendation: 'Restore agents/The_Guardian.md and the guardian report script.'
    });
  }

  return findings;
}

export function scanPhilosophy(): GuardianFinding[] {
  const findings: GuardianFinding[] = [];

  for (const section of PRODUCT_SECTIONS) {
    const expected = GUARDIAN_SECTION_QUESTIONS[section.id];
    if (section.question !== expected) {
      findings.push({
        id: `philosophy:section-question:${section.id}`,
        category: 'philosophy',
        severity: 'high',
        title: `Section question drift: ${section.id}`,
        detail: `Expected "${expected}" but found "${section.question}".`,
        why: 'Each page must answer only one life question. Drift signals scope creep.',
        recommendation: 'Restore the single question or split the section into a new surface.',
        file: 'lib/architecture/sections.ts'
      });
    }
  }

  return findings;
}

export function scanFakeData(): GuardianFinding[] {
  const findings: GuardianFinding[] = [];
  const page = read('app/page.tsx');

  if (/PROJECT_PROGRESS:\s*Record<string,\s*number>/.test(page)) {
    findings.push({
      id: 'fake-data:project-progress',
      category: 'trust',
      severity: 'high',
      title: 'Hardcoded project progress scores',
      detail: 'PROJECT_PROGRESS uses static percentages in app/page.tsx.',
      why: 'Fake scores reduce trust. Giuseppe cannot act on invented progress.',
      recommendation: 'Replace with measured progress, honest unknowns, or remove the metric.',
      file: 'app/page.tsx'
    });
  }

  const momentum = read('lib/brands/momentum.ts');
  if (/hashProject\(/.test(momentum) && /momentum\s*=\s*min\s*\+/.test(momentum)) {
    findings.push({
      id: 'fake-data:brand-momentum-hash',
      category: 'trust',
      severity: 'high',
      title: 'Hash-derived brand momentum percentages',
      detail:
        'lib/brands/momentum.ts derives momentum scores from project name hashes, not measured activity.',
      why: 'Brands surfaces display these as percentages — invented momentum is the same trust failure as PROJECT_PROGRESS.',
      recommendation:
        'Replace with real signals from presence/data-sources, or show qualitative signals without numeric percentages.',
      file: 'lib/brands/momentum.ts'
    });
  }

  const brandsStage = read('app/components/BrandsStage.tsx');
  if (/\{momentum\}%/.test(brandsStage) && /computeBrandMomentum/.test(brandsStage)) {
    findings.push({
      id: 'fake-data:brand-momentum-ui',
      category: 'trust',
      severity: 'medium',
      title: 'Brands UI renders hash momentum as a percentage',
      detail: 'BrandsStage displays computeBrandMomentum() output with a % suffix.',
      why: 'Numeric percentages imply measurement. Hash placeholders read as real performance.',
      recommendation: 'Show honest unknowns, qualitative momentum copy, or wire real evidence-backed scores.',
      file: 'app/components/BrandsStage.tsx'
    });
  }

  const ruleBased = read('lib/brain/providers/ruleBased.ts');
  if (/confidenceScore:\s*72/.test(ruleBased)) {
    findings.push({
      id: 'fake-data:rule-based-confidence',
      category: 'ai-consistency',
      severity: 'medium',
      title: 'Hardcoded confidence score in rule-based provider',
      detail: 'confidenceScore: 72 is fixed in lib/brain/providers/ruleBased.ts.',
      why: 'Static confidence mimics certainty without evidence.',
      recommendation: 'Derive confidence from signals or lower it when evidence is thin.',
      file: 'lib/brain/providers/ruleBased.ts'
    });
  }

  return findings;
}

export function scanMemoryPersistence(): GuardianFinding[] {
  const findings: GuardianFinding[] = [];
  const productionPaths = [
    'lib/memory/persistentStore.ts',
    'lib/memory/insights.ts',
    'lib/todays-letter/cache.ts',
    'lib/todays-letter/loadConstitution.ts',
    'lib/brain/memory/update.ts',
    'lib/brain/engines/pipeline.ts',
    'lib/insights/monthlyInsight.ts',
    'lib/presence/cache.ts',
    'lib/data-sources/store/supabase.ts'
  ];

  for (const relativePath of productionPaths) {
    const content = read(relativePath);
    if (!content) {
      continue;
    }

    if (/long_term\.json|working_memory\.json/.test(content)) {
      findings.push({
        id: `memory:json-path:${relativePath}`,
        category: 'trust',
        severity: 'critical',
        title: 'Local JSON memory path in production code',
        detail: `${relativePath} still references long_term.json or working_memory.json.`,
        why: 'Read-only serverless filesystems throw EROFS when Giuseppe OS writes local memory files.',
        recommendation: 'Route memory through Supabase or the in-memory persistent store only.',
        file: relativePath
      });
    }

    if (/from 'fs\/promises'|from "fs\/promises"|readFile|writeFile/.test(content)) {
      findings.push({
        id: `memory:filesystem:${relativePath}`,
        category: 'trust',
        severity: 'critical',
        title: 'Filesystem persistence in runtime memory path',
        detail: `${relativePath} still uses filesystem reads or writes.`,
        why: 'Production must not depend on local JSON files for memory or briefing cache.',
        recommendation: 'Use Supabase, in-memory cache, or bundled static imports instead.',
        file: relativePath
      });
    }
  }

  return findings;
}

export function scanDeadCode(): GuardianFinding[] {
  const findings: GuardianFinding[] = [];

  if (fileExists('public/avatar/avatar-eyes-debug-box.png')) {
    findings.push({
      id: 'dead-code:avatar-debug-box',
      category: 'dead-code',
      severity: 'low',
      title: 'Debug avatar asset in public/',
      detail: 'public/avatar/avatar-eyes-debug-box.png should not ship to production.',
      why: 'Debug artifacts increase bundle surface and signal unfinished work.',
      recommendation: 'Delete the debug asset or move it outside public/.',
      file: 'public/avatar/avatar-eyes-debug-box.png'
    });
  }

  const providersIndex = read('lib/brain/providers/index.ts');
  if (/@deprecated/.test(providersIndex)) {
    findings.push({
      id: 'dead-code:legacy-provider-exports',
      category: 'technical-debt',
      severity: 'info',
      title: 'Legacy AI provider exports remain in lib/brain/providers/',
      detail:
        'requesty/gemini exports are marked @deprecated. Live path is lib/ai/provider.ts + completionAdapter.',
      why: 'Stale provider files can mislead contributors into wiring the wrong AI path.',
      recommendation:
        'Remove deprecated providers after confirming zero imports, or relocate stubs under lib/ai/providers only.',
      file: 'lib/brain/providers/index.ts'
    });
  }

  return findings;
}

export function scanAiConsistency(): GuardianFinding[] {
  return grepFiles(/Math\.round\(item\.totalScore\)/, ['app/page.tsx']);
}

export function scanAiOrchestrator(): GuardianFinding[] {
  const findings: GuardianFinding[] = [];

  const jsonCompletion = read('lib/ai/jsonCompletion.ts');
  const jsonChain = read('lib/ai/jsonProviderChain.ts');
  const provider = read('lib/ai/provider.ts');
  const ruleBased = read('lib/brain/providers/ruleBased.ts');
  const insightEngine = read('lib/ai/insight-engine.ts');
  const decisionAi = read('lib/ai/decision-ai.ts');

  const jsonRepairMissing = requirePattern('lib/ai/jsonCompletion.ts', /JSON_REPAIR_USER_MESSAGE/, {
    id: 'ai-orchestrator:missing-json-repair',
    category: 'ai-consistency',
    severity: 'high',
    title: 'JSON repair retry may be missing from AI orchestrator',
    detail: 'completeWithJsonContract should enforce a JSON repair retry path.',
    why: 'Without repair retry, structured AI outputs silently break downstream parsers.',
    recommendation: 'Keep JSON_REPAIR_USER_MESSAGE and the two-attempt loop in lib/ai/jsonCompletion.ts.'
  });
  if (jsonRepairMissing) {
    findings.push(jsonRepairMissing);
  }

  if (jsonCompletion && !/for \(let attempt = 0; attempt < 2; attempt/.test(jsonCompletion)) {
    findings.push({
      id: 'ai-orchestrator:missing-retry-loop',
      category: 'ai-consistency',
      severity: 'high',
      title: 'JSON contract completion lacks retry loop',
      detail: 'lib/ai/jsonCompletion.ts should attempt parse + one repair retry.',
      why: 'Single-shot JSON parsing increases fallback-to-empty behavior.',
      recommendation: 'Restore the two-attempt loop with repair user message.',
      file: 'lib/ai/jsonCompletion.ts'
    });
  }

  if (!jsonChain.includes('completeJsonWithProviderChain')) {
    findings.push({
      id: 'ai-orchestrator:missing-json-chain',
      category: 'ai-consistency',
      severity: 'high',
      title: 'JSON provider chain entry point missing',
      detail: 'lib/ai/jsonProviderChain.ts should export completeJsonWithProviderChain.',
      why: 'Structured surfaces (insights, decisions) depend on the provider-agnostic JSON chain.',
      recommendation: 'Restore completeJsonWithProviderChain and provider logging wrapper.',
      file: 'lib/ai/jsonProviderChain.ts'
    });
  }

  if (!provider.includes('buildProviderChain')) {
    findings.push({
      id: 'ai-orchestrator:missing-provider-chain',
      category: 'ai-consistency',
      severity: 'high',
      title: 'Provider chain builder missing',
      detail: 'lib/ai/provider.ts should export buildProviderChain for orchestrated fallback.',
      why: 'Direct provider calls from UI would bypass logging, cost tracking, and mock routing.',
      recommendation: 'Route AI calls through buildProviderChain / completeWithProviderChain.',
      file: 'lib/ai/provider.ts'
    });
  }

  if (ruleBased && !/confidenceFromEvidence/.test(ruleBased)) {
    findings.push({
      id: 'ai-orchestrator:rule-based-evidence-gate-missing',
      category: 'ai-consistency',
      severity: 'medium',
      title: 'Rule-based provider may not gate confidence on evidence',
      detail: 'lib/brain/providers/ruleBased.ts should use confidenceFromEvidence / assessEvidence.',
      why: 'Mock-mode AI still shapes decisions — confidence must stay evidence-backed.',
      recommendation: 'Keep assessEvidence + confidenceFromEvidence in the rule-based fallback path.',
      file: 'lib/brain/providers/ruleBased.ts'
    });
  }

  if (
    insightEngine.includes('fetchOnlineSignals') &&
    /catch\s*\{[\s\S]*mock signals/.test(insightEngine)
  ) {
    findings.push({
      id: 'ai-orchestrator:insight-mock-fallback-silent',
      category: 'trust',
      severity: 'medium',
      title: 'Insights silently fall back to mock online signals',
      detail:
        'lib/ai/insight-engine.ts catch block returns deterministic mock signals when presence scan fails.',
      why: 'Mock signals can enter prompts without explicit uncertainty if the catch swallows upstream errors.',
      recommendation:
        'Label mock fallback in every locale, surface source:mock in UI, or prefer silence when presence is unavailable.',
      file: 'lib/ai/insight-engine.ts'
    });
  }

  if (
    insightEngine.includes("'Segnale:") &&
    insightEngine.includes("'Mock signal:") &&
    !/mock|esempio|simulat/i.test(insightEngine.match(/'Segnale:[^']+'/)?.[0] ?? '')
  ) {
    findings.push({
      id: 'ai-orchestrator:insight-mock-unlabeled-it',
      category: 'trust',
      severity: 'medium',
      title: 'Italian mock online signals are not labeled as mock',
      detail: 'Italian fetchOnlineSignals fallback strings use "Segnale:" without mock disclosure.',
      why: 'Insights may treat placeholder web signals as real activity in Italian UI.',
      recommendation: 'Prefix Italian fallback signals with explicit mock/simulated wording.',
      file: 'lib/ai/insight-engine.ts'
    });
  }

  if (
    decisionAi.includes('completeJsonWithProviderChain') &&
    /catch\s*\{[\s\S]*source = 'fallback'/.test(decisionAi)
  ) {
    findings.push({
      id: 'ai-orchestrator:decision-ai-silent-fallback',
      category: 'ai-consistency',
      severity: 'medium',
      title: 'Decision AI silently falls back when JSON chain fails',
      detail: 'lib/ai/decision-ai.ts sets source=fallback on caught provider errors without surfacing why.',
      why: 'Silent fallback can hide provider outages and look like measured AI analysis.',
      recommendation: 'Log the failure, lower confidence, or return explicit uncertainty to the client.',
      file: 'lib/ai/decision-ai.ts'
    });
  }

  if (/confidence:\s*55/.test(decisionAi) && /isAIMockMode\(\)/.test(decisionAi)) {
    findings.push({
      id: 'ai-orchestrator:decision-mock-confidence-fixed',
      category: 'ai-consistency',
      severity: 'low',
      title: 'Fixed mock confidence in decision AI',
      detail: 'lib/ai/decision-ai.ts uses confidence: 55 in mock mode.',
      why: 'Even mock mode should model evidence gating, not a static mid-score.',
      recommendation: 'Derive mock confidence from assessEvidence like the rule-based provider.',
      file: 'lib/ai/decision-ai.ts'
    });
  }

  return findings;
}

export function scanContentGenerator(): GuardianFinding[] {
  const findings: GuardianFinding[] = [];
  const rules = read('lib/content/rules.ts');
  const generate = read('lib/content/generate.ts');
  const prompts = read('lib/content/prompts.ts');

  if (!rules.includes('MEDIUM_BIO_BLOCK')) {
    findings.push({
      id: 'content:missing-medium-bio',
      category: 'ai-consistency',
      severity: 'high',
      title: 'Content generator missing Medium bio block',
      detail: 'lib/content/rules.ts should define MEDIUM_BIO_BLOCK for editorial consistency.',
      why: 'Medium output must end with the canonical English bio — not an improvised one.',
      recommendation: 'Restore MEDIUM_BIO_BLOCK and reference it from prompts.',
      file: 'lib/content/rules.ts'
    });
  }

  if (!rules.includes('[VERIFY:') && !rules.includes('VERIFY:')) {
    findings.push({
      id: 'content:missing-verify-placeholder',
      category: 'ai-consistency',
      severity: 'medium',
      title: 'Content editorial rules may allow invented facts',
      detail: 'lib/content/rules.ts should instruct [VERIFY: detail needed] for missing facts.',
      why: 'Creative output must not invent biography or history.',
      recommendation: 'Keep the VERIFY placeholder rule in buildContentEditorialRules.',
      file: 'lib/content/rules.ts'
    });
  }

  if (!generate.includes('buildContentSystemPrompt')) {
    findings.push({
      id: 'content:missing-system-prompt',
      category: 'ai-consistency',
      severity: 'high',
      title: 'Content generator bypasses editorial system prompt',
      detail: 'lib/content/generate.ts should call buildContentSystemPrompt for live generation.',
      why: 'Without the system prompt, tone and fact-grounding rules are not enforced.',
      recommendation: 'Pass buildContentSystemPrompt(locale) as the provider system message.',
      file: 'lib/content/generate.ts'
    });
  }

  if (!prompts.includes('MEDIUM_BIO_BLOCK')) {
    findings.push({
      id: 'content:missing-bio-in-prompts',
      category: 'ai-consistency',
      severity: 'medium',
      title: 'Medium format prompt may omit verbatim bio block',
      detail: 'lib/content/prompts.ts should inject MEDIUM_BIO_BLOCK into the Medium user prompt.',
      why: 'Bio drift breaks brand consistency across Giuseppe channels.',
      recommendation: 'Keep the verbatim English bio instruction in buildFormatUserPrompt for medium.',
      file: 'lib/content/prompts.ts'
    });
  }

  return findings;
}

export function scanPresenceAndDataSources(): GuardianFinding[] {
  const findings: GuardianFinding[] = [];
  const presenceCanonical = read('lib/presence/canonical.ts');
  const dataSourcesIngest = read('lib/data-sources/ingest.ts');
  const dataSourcesTypes = read('lib/data-sources/types.ts');

  if (presenceCanonical && /google|generic search/i.test(presenceCanonical)) {
    findings.push({
      id: 'presence:generic-search',
      category: 'trust',
      severity: 'high',
      title: 'Presence engine may allow generic web search',
      detail: 'lib/presence/canonical.ts should list only Giuseppe canonical channels.',
      why: 'Generic search introduces unverified third-party context.',
      recommendation: 'Keep presence scoped to canonical URLs and approved feeds only.',
      file: 'lib/presence/canonical.ts'
    });
  }

  if (dataSourcesTypes && !dataSourcesTypes.includes("readOnly: true")) {
    findings.push({
      id: 'data-sources:write-capable',
      category: 'trust',
      severity: 'critical',
      title: 'Personal data sources may allow write operations',
      detail: 'DataSource type should enforce readOnly: true.',
      why: 'Giuseppe OS must never auto-post from ingestion connectors.',
      recommendation: 'Keep read-only types and connector contracts.',
      file: 'lib/data-sources/types.ts'
    });
  }

  if (dataSourcesIngest && !/errors\.push/.test(dataSourcesIngest)) {
    findings.push({
      id: 'data-sources:missing-graceful-errors',
      category: 'trust',
      severity: 'medium',
      title: 'Data source ingestion may not fail gracefully',
      detail: 'ingestFromSource should record connector errors instead of throwing.',
      why: 'Missing OAuth permissions should not crash the pipeline.',
      recommendation: 'Return SourceIngestionResult.errors for needs_auth / not_configured.',
      file: 'lib/data-sources/ingest.ts'
    });
  }

  return findings;
}

export function scanWeeklyBoard(): GuardianFinding[] {
  const findings: GuardianFinding[] = [];
  const weekly = read('lib/weekly-board/buildContext.ts');

  if (!weekly.includes('gatherOracleEvidence')) {
    findings.push({
      id: 'weekly-board:missing-oracle-evidence',
      category: 'trust',
      severity: 'high',
      title: 'Weekly board may bypass Oracle evidence',
      detail: 'lib/weekly-board/buildContext.ts should call gatherOracleEvidence.',
      why: 'Weekly synthesis must use measured decisions/outcomes, not invented narrative.',
      recommendation: 'Keep Oracle evidence gathering and week filtering in buildWeeklyBoardContext.',
      file: 'lib/weekly-board/buildContext.ts'
    });
  }

  if (!weekly.includes('filterEvidenceToPastWeek')) {
    findings.push({
      id: 'weekly-board:missing-week-filter',
      category: 'ai-consistency',
      severity: 'medium',
      title: 'Weekly board may include unbounded evidence',
      detail: 'buildContext should filter Oracle evidence to the past week.',
      why: 'Stale evidence weakens the weekly board signal-to-noise ratio.',
      recommendation: 'Keep filterEvidenceToPastWeek with LOOKBACK_DAYS window.',
      file: 'lib/weekly-board/buildContext.ts'
    });
  }

  return findings;
}

export function scanProductSimplicity(): GuardianFinding[] {
  const findings: GuardianFinding[] = [];
  const page = read('app/page.tsx');
  const disclosureCount = (page.match(/DisclosureTrigger/g) ?? []).length;

  if (disclosureCount > 24) {
    findings.push({
      id: 'simplicity:disclosure-density',
      category: 'cognitive-load',
      severity: 'medium',
      title: 'High progressive-disclosure density on home shell',
      detail: `${disclosureCount} DisclosureTrigger usages in app/page.tsx.`,
      why: 'Too many entry points increase cognitive load and weaken Today readability.',
      recommendation: 'Audit which disclosures are essential on first load vs. deep paths.',
      file: 'app/page.tsx'
    });
  }

  const globals = read('app/globals.css');
  const lineCount = globals.split('\n').length;
  if (lineCount > 2400) {
    findings.push({
      id: 'simplicity:globals-css-size',
      category: 'technical-debt',
      severity: 'low',
      title: 'Large global stylesheet',
      detail: `app/globals.css has ${lineCount} lines.`,
      why: 'Monolithic CSS makes consistency harder and raises regression risk.',
      recommendation: 'Split by surface when the next design pass lands; until then, avoid new global rules.',
      file: 'app/globals.css'
    });
  }

  return findings;
}

export function scanDecisionLearning(): GuardianFinding[] {
  const findings: GuardianFinding[] = [];
  const learning = read('lib/decision-learning/learning.ts');
  const oracle = read('lib/oracle/evidence.ts');

  if (!learning.includes('reviewCompletedAt')) {
    findings.push({
      id: 'decision-learning:missing-review-timestamp',
      category: 'trust',
      severity: 'high',
      title: 'Decision reviews may not be timestamped',
      detail: 'applyDecisionReview should set reviewCompletedAt before outcomes become Oracle evidence.',
      why: 'Without a review timestamp, Giuseppe OS cannot distinguish measured outcomes from assumptions.',
      recommendation: 'Ensure every reviewed decision writes reviewCompletedAt and status reviewed.',
      file: 'lib/decision-learning/learning.ts'
    });
  }

  if (!oracle.includes('reviewed')) {
    findings.push({
      id: 'decision-learning:oracle-unreviewed-outcomes',
      category: 'ai-consistency',
      severity: 'high',
      title: 'Oracle may surface unreviewed outcomes',
      detail: 'gatherOracleEvidence should only treat reviewed outcomes as memory.',
      why: 'Future Giuseppe must not say it remembers something that was never measured.',
      recommendation: 'Filter Oracle outcomes to reviewed decisions only.',
      file: 'lib/oracle/evidence.ts'
    });
  }

  return findings;
}

export function scanSelfModel(): GuardianFinding[] {
  const findings: GuardianFinding[] = [];
  const summary = read('lib/self-model/summary.ts');
  const estimate = read('lib/self-model/estimate.ts');

  if (!fileExists('lib/self-model/store.ts')) {
    findings.push({
      id: 'self-model:missing-store',
      category: 'trust',
      severity: 'high',
      title: 'Self Model store is missing',
      detail: 'lib/self-model/store.ts was not found.',
      why: 'Without persistence, Giuseppe OS cannot build a measured model over time.',
      recommendation: 'Restore lib/self-model/ with Supabase-backed load/save.',
      file: 'lib/self-model/store.ts'
    });
  }

  if (!summary.includes('SUFFICIENT_EVIDENCE_COUNT')) {
    findings.push({
      id: 'self-model:missing-evidence-gate',
      category: 'trust',
      severity: 'high',
      title: 'Self Model summary may expose low-evidence estimates',
      detail: 'getSelfModelSummary should gate on SUFFICIENT_EVIDENCE_COUNT.',
      why: 'Surfacing unknown dimensions as facts erodes trust.',
      recommendation: 'Only include dimensions where evidence_count meets the threshold.',
      file: 'lib/self-model/summary.ts'
    });
  }

  if (!estimate.includes('UNKNOWN_ESTIMATE')) {
    findings.push({
      id: 'self-model:missing-unknown-default',
      category: 'ai-consistency',
      severity: 'medium',
      title: 'Self Model may invent estimates without evidence',
      detail: 'deriveDimensionEstimate should default to unknown below the evidence threshold.',
      why: 'Invented self-knowledge is worse than silence.',
      recommendation: 'Keep current_estimate as unknown until evidence is sufficient.',
      file: 'lib/self-model/estimate.ts'
    });
  }

  const learning = read('lib/decision-learning/learning.ts');
  if (!learning.includes('updateSelfModelFromDecision')) {
    findings.push({
      id: 'self-model:decision-hook-missing',
      category: 'trust',
      severity: 'medium',
      title: 'Decision reviews may not update Self Model',
      detail: 'applyDecisionReview should call updateSelfModelFromDecision after save.',
      why: 'Reviewed outcomes are the strongest evidence for how Giuseppe actually decides.',
      recommendation: 'Hook updateSelfModelFromDecision at the end of applyDecisionReview.',
      file: 'lib/decision-learning/learning.ts'
    });
  }

  const dataBridge = read('lib/data-sources/self-model-bridge.ts');
  if (dataBridge && !dataBridge.includes('evidence:')) {
    findings.push({
      id: 'self-model:data-source-attribution-missing',
      category: 'trust',
      severity: 'medium',
      title: 'Data source evidence may lack attribution in Self Model',
      detail: 'applyEvidenceToSelfModel should prefix evidence_sources with evidence:attribution.',
      why: 'Imported personal data must remain traceable, not blended as generic notes.',
      recommendation: 'Keep evidence: attribution prefixes in self-model-bridge.ts.',
      file: 'lib/data-sources/self-model-bridge.ts'
    });
  }

  return findings;
}

export function runAllScans(): GuardianFinding[] {
  return dedupeFindings([
    ...scanGuardianPresence(),
    ...scanPhilosophy(),
    ...scanFakeData(),
    ...scanMemoryPersistence(),
    ...scanDeadCode(),
    ...scanAiConsistency(),
    ...scanAiOrchestrator(),
    ...scanContentGenerator(),
    ...scanPresenceAndDataSources(),
    ...scanWeeklyBoard(),
    ...scanProductSimplicity(),
    ...scanDecisionLearning(),
    ...scanSelfModel()
  ]);
}

/** Documented scan targets — update when architecture shifts. */
export const GUARDIAN_SCAN_PATHS = [
  'agents/The_Guardian.md',
  'lib/architecture/sections.ts',
  'app/page.tsx',
  'app/components/BrandsStage.tsx',
  'app/globals.css',
  'lib/brands/momentum.ts',
  'lib/brain/providers/ruleBased.ts',
  'lib/brain/providers/index.ts',
  'lib/ai/jsonCompletion.ts',
  'lib/ai/jsonProviderChain.ts',
  'lib/ai/provider.ts',
  'lib/ai/insight-engine.ts',
  'lib/ai/decision-ai.ts',
  'lib/content/rules.ts',
  'lib/content/generate.ts',
  'lib/content/prompts.ts',
  'lib/presence/canonical.ts',
  'lib/data-sources/types.ts',
  'lib/data-sources/ingest.ts',
  'lib/data-sources/self-model-bridge.ts',
  'lib/weekly-board/buildContext.ts',
  'lib/memory/persistentStore.ts',
  'lib/memory/insights.ts',
  'lib/todays-letter/cache.ts',
  'lib/todays-letter/loadConstitution.ts',
  'lib/brain/memory/update.ts',
  'lib/brain/engines/pipeline.ts',
  'lib/insights/monthlyInsight.ts',
  'lib/presence/cache.ts',
  'lib/data-sources/store/supabase.ts',
  'lib/decision-learning/learning.ts',
  'lib/oracle/evidence.ts',
  'lib/self-model/store.ts',
  'lib/self-model/summary.ts',
  'lib/self-model/estimate.ts',
  'public/avatar/avatar-eyes-debug-box.png'
] as const;
