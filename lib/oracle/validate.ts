import type { DailyBriefingSections } from '../briefing/types';
import { formatEvidenceForPrompt } from './formatEvidence';
import type { OracleEvidence, OracleValidationReport } from './types';

function extractNumbers(text: string): string[] {
  const matches = text.match(/\d+(?:[.,]\d+)?/g) ?? [];
  return Array.from(new Set(matches.map(value => value.replace(',', '.'))));
}

function extractFractionPatterns(text: string): string[] {
  const matches = text.match(/\d+\s*(?:su|out of|\/)\s*\d+/gi) ?? [];
  return matches.map(value => value.toLowerCase());
}

export function validateOracleClaims(
  sections: Pick<DailyBriefingSections, 'oneBigMove' | 'reflection'>,
  evidence: OracleEvidence
): OracleValidationReport {
  const evidenceText = formatEvidenceForPrompt(evidence).toLowerCase();
  const warnings: string[] = [];

  for (const field of ['oneBigMove', 'reflection'] as const) {
    const text = sections[field];
    if (!text?.trim()) {
      continue;
    }

    for (const number of extractNumbers(text)) {
      if (!evidenceText.includes(number.toLowerCase())) {
        warnings.push(`${field}: number "${number}" not found in evidence block`);
      }
    }

    for (const fraction of extractFractionPatterns(text)) {
      if (!evidenceText.includes(fraction)) {
        warnings.push(`${field}: fraction "${fraction}" not found in evidence block`);
      }
    }
  }

  if (warnings.length > 0) {
    console.warn('[oracle-validation]', warnings.join(' | '));
  }

  return {
    passed: warnings.length === 0,
    warnings
  };
}
