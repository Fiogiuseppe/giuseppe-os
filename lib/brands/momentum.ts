import { pickLocale, type AppLocale } from '../i18n/locale';
import { getSourceConnector } from '../data-sources/connectors/registry';
import { getDataSourceStore } from '../data-sources/store';
import type { DataSourceId, EvidenceItem } from '../data-sources/types';

const MOMENTUM_WINDOW_DAYS = 28;
const MOMENTUM_TARGET_POSTS = 4;

export type BrandMomentum =
  | {
      status: 'available';
      momentum: number;
      signal: string;
    }
  | {
      status: 'unavailable';
      message: string;
    };

type BrandEvidenceQuery = {
  source: DataSourceId;
  account: string;
};

const BRAND_EVIDENCE_QUERIES: Record<string, BrandEvidenceQuery[]> = {
  UREES: [
    { source: 'website', account: 'urees' },
    { source: 'instagram', account: '@urees__' }
  ],
  'Visceral Poems': [{ source: 'website', account: 'fiogiuseppe' }],
  'Brand Giuseppe': [
    { source: 'website', account: 'fiogiuseppe' },
    { source: 'instagram', account: '@fiogiuseppe' },
    { source: 'linkedin', account: 'fiogiuseppe' }
  ],
  'Medium/LinkedIn': [
    { source: 'manual_import', account: 'giuseppe' },
    { source: 'linkedin', account: 'fiogiuseppe' }
  ],
  LEGO: [],
  Freelance: []
};

function brandMomentumUnavailable(locale: AppLocale): BrandMomentum {
  return {
    status: 'unavailable',
    message: pickLocale(
      locale,
      'Dati insufficienti — collega una fonte per vedere il momentum.',
      'Not enough data yet — connect a source to see momentum.'
    )
  };
}

function momentumSignal(locale: AppLocale, status: string, momentum: number): string {
  if (momentum >= 75) {
    return pickLocale(
      locale,
      'Ritmo solido — la marca sta compounding.',
      'Solid rhythm — the brand is compounding.'
    );
  }

  if (status === 'slow-active') {
    return pickLocale(
      locale,
      'Attiva ma lenta — serve una mossa questa settimana.',
      'Active but slow — needs one move this week.'
    );
  }

  if (status === 'selective') {
    return pickLocale(
      locale,
      'Selettiva per design — qualità sopra volume.',
      'Selective by design — quality over volume.'
    );
  }

  return pickLocale(
    locale,
    'Momentum in crescita — proteggi la concentrazione.',
    'Momentum building — protect focus.'
  );
}

async function collectBrandEvidence(queries: BrandEvidenceQuery[]): Promise<EvidenceItem[]> {
  if (queries.length === 0) {
    return [];
  }

  const store = getDataSourceStore();
  const evidence: EvidenceItem[] = [];

  for (const query of queries) {
    const connector = getSourceConnector(query.source);
    if (!connector.isConfigured()) {
      continue;
    }

    const items = await store.listEvidenceBySource(query.source, query.account, 100);
    evidence.push(...items);
  }

  return evidence;
}

function computeMomentumFromEvidence(evidence: EvidenceItem[]): number {
  // Measures publishing cadence: percent of a 4-posts-per-28-days target from synced evidence.
  const windowMs = MOMENTUM_WINDOW_DAYS * 24 * 60 * 60 * 1000;
  const now = Date.now();
  const recentPosts = evidence.filter(item => {
    const publishedAt = new Date(item.publishedAt).getTime();
    return Number.isFinite(publishedAt) && now - publishedAt <= windowMs;
  });

  return Math.min(100, Math.round((recentPosts.length / MOMENTUM_TARGET_POSTS) * 100));
}

export async function computeBrandMomentum(
  projectName: string,
  status: string,
  locale: AppLocale = 'it'
): Promise<BrandMomentum> {
  const queries = BRAND_EVIDENCE_QUERIES[projectName] ?? [];
  const evidence = await collectBrandEvidence(queries);

  if (evidence.length === 0) {
    return brandMomentumUnavailable(locale);
  }

  const momentum = computeMomentumFromEvidence(evidence);

  return {
    status: 'available',
    momentum,
    signal: momentumSignal(locale, status, momentum)
  };
}
