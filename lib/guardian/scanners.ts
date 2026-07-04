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

function grepFiles(pattern: RegExp, globs: string[]): GuardianFinding[] {
  const findings: GuardianFinding[] = [];

  for (const relativePath of globs) {
    const content = read(relativePath);
    if (!content || !pattern.test(content)) {
      continue;
    }

    findings.push({
      id: `grep:${relativePath}:${pattern.source}`,
      category: 'ai-consistency',
      severity: 'medium',
      title: `Pattern detected: ${pattern.source}`,
      detail: `Matched in ${relativePath}.`,
      why: 'The Guardian flags patterns that can erode trust or introduce fake certainty.',
      recommendation: 'Review this usage and ensure evidence, uncertainty, or silence is explicit.',
      file: relativePath
    });
  }

  return findings;
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

export function scanDeadCode(): GuardianFinding[] {
  const findings: GuardianFinding[] = [];
  const page = read('app/page.tsx');
  const jewelFace = read('app/components/JewelFace.tsx');

  if (jewelFace && !/JewelFace/.test(page)) {
    findings.push({
      id: 'dead-code:jewel-face',
      category: 'unused-components',
      severity: 'medium',
      title: 'Unused JewelFace component',
      detail: 'app/components/JewelFace.tsx exists but is not imported in the app shell.',
      why: 'Unused components add maintenance cost and visual inconsistency risk.',
      recommendation: 'Remove JewelFace or document why it is kept for a near-term migration.',
      file: 'app/components/JewelFace.tsx'
    });
  }

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

  return findings;
}

export function scanAiConsistency(): GuardianFinding[] {
  return grepFiles(/Math\.round\(item\.totalScore\)/, ['app/page.tsx']);
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

export function runAllScans(): GuardianFinding[] {
  return dedupeFindings([
    ...scanGuardianPresence(),
    ...scanPhilosophy(),
    ...scanFakeData(),
    ...scanDeadCode(),
    ...scanAiConsistency(),
    ...scanProductSimplicity()
  ]);
}
