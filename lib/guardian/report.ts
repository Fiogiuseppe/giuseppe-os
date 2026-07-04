import { GUARDIAN_FINAL_QUESTION, GUARDIAN_LOW_CONFIDENCE_PHRASE } from './constitution';
import { runAllScans } from './scanners';
import type { GuardianDimensionScore, GuardianFinding, GuardianReport } from './types';

const SEVERITY_WEIGHT: Record<GuardianFinding['severity'], number> = {
  critical: 30,
  high: 18,
  medium: 10,
  low: 5,
  info: 2
};

function dimensionScore(findings: GuardianFinding[], categories: GuardianFinding['category'][]): number {
  const penalty = findings
    .filter(finding => categories.includes(finding.category))
    .reduce((sum, finding) => sum + SEVERITY_WEIGHT[finding.severity], 0);

  return Math.max(0, Math.min(100, 100 - penalty));
}

function buildDimensions(findings: GuardianFinding[]): GuardianDimensionScore[] {
  const trust = dimensionScore(findings, ['trust', 'ai-consistency', 'philosophy']);
  const simplicity = dimensionScore(findings, ['simplicity', 'cognitive-load', 'product']);
  const codeQuality = dimensionScore(findings, ['code-quality', 'dead-code', 'unused-components', 'duplication', 'technical-debt']);
  const performance = dimensionScore(findings, ['performance']);
  const aiQuality = dimensionScore(findings, ['ai-consistency', 'trust']);

  return [
    {
      id: 'trust',
      label: 'Trust',
      score: trust,
      summary: trust >= 90 ? 'Trust signals are mostly honest.' : 'Trust risks need attention before shipping.'
    },
    {
      id: 'simplicity',
      label: 'Product Simplicity',
      score: simplicity,
      summary: simplicity >= 90 ? 'Surface area remains focused.' : 'Complexity or cognitive load is creeping in.'
    },
    {
      id: 'code-quality',
      label: 'Code Quality',
      score: codeQuality,
      summary: codeQuality >= 90 ? 'Codebase hygiene is strong.' : 'Dead code or debt is accumulating.'
    },
    {
      id: 'performance',
      label: 'Performance',
      score: performance || 95,
      summary: 'No automated performance regressions detected in this pass.'
    },
    {
      id: 'ai-quality',
      label: 'AI Quality',
      score: aiQuality,
      summary:
        aiQuality >= 85
          ? 'AI outputs appear grounded.'
          : `Prefer "${GUARDIAN_LOW_CONFIDENCE_PHRASE}" over invented certainty.`
    }
  ];
}

function pickHighestPriority(findings: GuardianFinding[]): GuardianFinding | null {
  const order: GuardianFinding['severity'][] = ['critical', 'high', 'medium', 'low', 'info'];
  for (const severity of order) {
    const match = findings.find(finding => finding.severity === severity);
    if (match) {
      return match;
    }
  }
  return null;
}

function futureRecommendation(findings: GuardianFinding[]): string {
  if (findings.some(finding => finding.id === 'fake-data:project-progress')) {
    return 'Replace fake project scores with measured or explicitly uncertain progress before adding more AI features.';
  }

  if (findings.some(finding => finding.category === 'ai-consistency')) {
    return 'Strengthen evidence panels and silence paths before expanding recommendation surfaces.';
  }

  return 'Implement persistent memory before adding more AI features.';
}

function overallHealth(dimensions: GuardianDimensionScore[]): number {
  if (dimensions.length === 0) {
    return 100;
  }

  const total = dimensions.reduce((sum, dimension) => sum + dimension.score, 0);
  return Math.round(total / dimensions.length);
}

function finalAnswer(findings: GuardianFinding[]): string {
  const blocking = findings.filter(finding => finding.severity === 'critical' || finding.severity === 'high');
  return blocking.length === 0 ? 'yes' : 'not yet';
}

export function buildGuardianReport(version: string): GuardianReport {
  const findings = runAllScans();
  const dimensions = buildDimensions(findings);
  const highestPriority = pickHighestPriority(findings);

  return {
    generatedAt: new Date().toISOString(),
    version,
    overallHealth: overallHealth(dimensions),
    dimensions,
    findings,
    highestPriority,
    futureRecommendation: futureRecommendation(findings),
    rejectedFeatures: [],
    finalQuestion: GUARDIAN_FINAL_QUESTION,
    finalAnswer: finalAnswer(findings)
  };
}

export function formatGuardianReport(report: GuardianReport): string {
  const lines: string[] = [
    '--------------------------------------------------',
    '',
    'Guardian Report',
    '',
    'Overall Health',
    '',
    `${report.overallHealth} / 100`,
    ''
  ];

  for (const dimension of report.dimensions) {
    lines.push(dimension.label, '', String(dimension.score), '');
  }

  lines.push(
    'Technical Debt',
    '',
    `${report.findings.length} issue${report.findings.length === 1 ? '' : 's'}`,
    '',
    'Highest Priority',
    ''
  );

  if (report.highestPriority) {
    lines.push(
      report.highestPriority.title,
      '',
      report.highestPriority.why,
      '',
      report.highestPriority.recommendation,
      ''
    );
  } else {
    lines.push('No blocking issues detected in this pass.', '');
  }

  lines.push('Future Recommendation', '', report.futureRecommendation, '', 'Final Question', '', report.finalQuestion, '', report.finalAnswer, '');

  if (report.findings.length > 0) {
    lines.push('Findings', '');
    for (const finding of report.findings) {
      lines.push(
        `- [${finding.severity.toUpperCase()}] ${finding.title}`,
        `  Why: ${finding.why}`,
        `  Action: ${finding.recommendation}${finding.file ? ` (${finding.file})` : ''}`,
        ''
      );
    }
  }

  lines.push('--------------------------------------------------');

  return lines.join('\n');
}
