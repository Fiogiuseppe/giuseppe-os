import type { EvidenceItem } from '../../../../lib/data-sources/types';
import type { KnowledgeExtractionCandidate, KnowledgeExtractor, KnowledgeExtractorInput } from './knowledge-extractor.types';
import type { KnowledgeType } from '../models/knowledge.types';

type WebsiteRule = {
  pattern: RegExp;
  knowledgeType: KnowledgeType;
  label: string;
  confidence: number;
};

/** Deterministic, rule-based extraction — no LLM. Order matters (specific before general). */
const WEBSITE_RULES: WebsiteRule[] = [
  { pattern: /visceral poems/i, knowledgeType: 'project', label: 'Visceral Poems', confidence: 0.95 },
  { pattern: /\burees\b/i, knowledgeType: 'brand', label: 'UREES', confidence: 0.95 },
  { pattern: /brand identity/i, knowledgeType: 'topic', label: 'Brand Identity', confidence: 0.85 },
  { pattern: /creative direction/i, knowledgeType: 'service', label: 'Creative Direction', confidence: 0.85 },
  { pattern: /\bbranding\b/i, knowledgeType: 'service', label: 'Branding', confidence: 0.85 },
  { pattern: /\bpainting\b/i, knowledgeType: 'topic', label: 'Painting', confidence: 0.8 },
  { pattern: /\bpoems\b/i, knowledgeType: 'topic', label: 'Poems', confidence: 0.75 },
  { pattern: /\bart\b/i, knowledgeType: 'topic', label: 'Art', confidence: 0.75 }
];

function evidenceConfidenceToNumber(confidence: EvidenceItem['confidence']): number {
  if (confidence === 'high') {
    return 0.9;
  }
  if (confidence === 'medium') {
    return 0.75;
  }
  return 0.6;
}

function buildEvidenceText(evidence: EvidenceItem): string {
  return [evidence.summary, evidence.permalink, evidence.attribution].filter(Boolean).join(' ');
}

function matchRules(evidence: EvidenceItem): KnowledgeExtractionCandidate[] {
  const text = buildEvidenceText(evidence);
  const matches: KnowledgeExtractionCandidate[] = [];
  const seen = new Set<string>();

  for (const rule of WEBSITE_RULES) {
    if (!rule.pattern.test(text)) {
      continue;
    }

    const key = `${rule.knowledgeType}:${rule.label.toLowerCase()}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);

    const blended = Math.min(
      1,
      Math.max(rule.confidence, evidenceConfidenceToNumber(evidence.confidence) * 0.5 + rule.confidence * 0.5)
    );

    matches.push({
      knowledgeType: rule.knowledgeType,
      label: rule.label,
      summary: `Mentioned in website evidence: ${evidence.summary.slice(0, 180)}`,
      confidence: Number(blended.toFixed(2)),
      evidenceId: evidence.id,
      evidenceUrl: evidence.permalink,
      metadata: {
        extractor: 'website-knowledge',
        matchedPattern: rule.pattern.source
      }
    });
  }

  return matches;
}

export function extractWebsiteKnowledge(input: KnowledgeExtractorInput): KnowledgeExtractionCandidate[] {
  const candidates: KnowledgeExtractionCandidate[] = [];

  for (const evidence of input.evidence) {
    candidates.push(...matchRules(evidence));
  }

  return candidates;
}

export const websiteKnowledgeExtractor: KnowledgeExtractor = {
  sourceIds: ['website_personal', 'website_urees'],
  extract: extractWebsiteKnowledge
};
