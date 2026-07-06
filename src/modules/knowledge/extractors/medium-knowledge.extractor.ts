import type { EvidenceItem } from '../../../../lib/data-sources/types';
import type {
  KnowledgeExtractionCandidate,
  KnowledgeExtractor,
  KnowledgeExtractorInput
} from './knowledge-extractor.types';
import type { KnowledgeType } from '../models/knowledge.types';

type MediumRule = {
  pattern: RegExp;
  knowledgeType: KnowledgeType;
  label: string;
  confidence: number;
};

/** Deterministic Medium extraction — topics/themes from public article evidence. No LLM. */
const MEDIUM_RULES: MediumRule[] = [
  {
    pattern: /decision intelligence/i,
    knowledgeType: 'topic',
    label: 'Decision Intelligence',
    confidence: 0.92
  },
  {
    pattern: /visceral poems/i,
    knowledgeType: 'project',
    label: 'Visceral Poems',
    confidence: 0.9
  },
  {
    pattern: /creative direction/i,
    knowledgeType: 'service',
    label: 'Creative Direction',
    confidence: 0.85
  },
  {
    pattern: /\bbranding\b/i,
    knowledgeType: 'service',
    label: 'Branding',
    confidence: 0.85
  },
  {
    pattern: /\bpoems\b/i,
    knowledgeType: 'topic',
    label: 'Poems',
    confidence: 0.75
  },
  {
    pattern: /\bart\b/i,
    knowledgeType: 'topic',
    label: 'Art',
    confidence: 0.75
  }
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

function tagCandidates(evidence: EvidenceItem): KnowledgeExtractionCandidate[] {
  const tagMatch = evidence.summary.match(/tags?:\s*([^.]+)/i);
  if (!tagMatch?.[1]) {
    return [];
  }

  const tags = tagMatch[1]
    .split(',')
    .map(tag => tag.trim())
    .filter(Boolean);

  return tags.slice(0, 5).map(tag => ({
    knowledgeType: 'topic',
    label: tag,
    summary: `Tagged in Medium evidence: ${evidence.summary.slice(0, 160)}`,
    confidence: 0.78,
    evidenceId: evidence.id,
    evidenceUrl: evidence.permalink,
    metadata: {
      extractor: 'medium-knowledge',
      matchedTag: tag
    }
  }));
}

function matchRules(evidence: EvidenceItem): KnowledgeExtractionCandidate[] {
  const text = buildEvidenceText(evidence);
  const matches: KnowledgeExtractionCandidate[] = [];
  const seen = new Set<string>();

  for (const rule of MEDIUM_RULES) {
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
      summary: `Mentioned in Medium evidence: ${evidence.summary.slice(0, 180)}`,
      confidence: Number(blended.toFixed(2)),
      evidenceId: evidence.id,
      evidenceUrl: evidence.permalink,
      metadata: {
        extractor: 'medium-knowledge',
        matchedPattern: rule.pattern.source
      }
    });
  }

  return matches;
}

export function extractMediumKnowledge(input: KnowledgeExtractorInput): KnowledgeExtractionCandidate[] {
  const candidates: KnowledgeExtractionCandidate[] = [];

  for (const evidence of input.evidence) {
    candidates.push(...matchRules(evidence), ...tagCandidates(evidence));
  }

  return candidates;
}

export const mediumKnowledgeExtractor: KnowledgeExtractor = {
  sourceIds: ['medium_personal'],
  extract: extractMediumKnowledge
};
