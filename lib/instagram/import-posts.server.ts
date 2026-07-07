import type { KnowledgeOwner } from '../../src/modules/knowledge/models/knowledge.types';
import { upsertKnowledgeCandidate } from '../../src/modules/knowledge/services/knowledge-persistence.server';
import { fetchInstagramPostMetadata } from './fetch-post-metadata.server';

export type InstagramImportResult = {
  url: string;
  shortcode: string;
  title: string;
  handle: string;
  sourceId: string;
  created: boolean;
  knowledgeId: string;
};

function resolveOwner(handle: string): KnowledgeOwner {
  return 'giuseppe';
}

export async function importInstagramPosts(urls: string[]): Promise<{
  imported: InstagramImportResult[];
  errors: Array<{ url: string; message: string }>;
}> {
  const imported: InstagramImportResult[] = [];
  const errors: Array<{ url: string; message: string }> = [];

  for (const rawUrl of urls) {
    const url = rawUrl.trim();
    if (!url) {
      continue;
    }

    try {
      const meta = await fetchInstagramPostMetadata(url);
      const evidenceId = `evidence_instagram_manual_${meta.shortcode.replace(/[^a-zA-Z0-9]+/g, '_')}`;
      const label = meta.title.slice(0, 120) || `Instagram ${meta.shortcode}`;

      const result = await upsertKnowledgeCandidate({
        owner: resolveOwner(meta.handle),
        sourceId: meta.sourceId,
        sourceType: 'social',
        candidate: {
          knowledgeType: 'statement',
          label,
          summary: meta.description.slice(0, 500),
          confidence: 0.8,
          evidenceId,
          evidenceUrl: meta.url,
          metadata: {
            extractor: 'instagram-manual-og',
            shortcode: meta.shortcode,
            handle: meta.handle,
            importMode: 'manual_og',
            fullTitle: meta.title
          }
        },
        status: 'active'
      });

      imported.push({
        url: meta.url,
        shortcode: meta.shortcode,
        title: meta.title,
        handle: meta.handle,
        sourceId: meta.sourceId,
        created: result.created,
        knowledgeId: result.item.id
      });
    } catch (error) {
      errors.push({
        url,
        message: error instanceof Error ? error.message : 'Import failed.'
      });
    }
  }

  return { imported, errors };
}
