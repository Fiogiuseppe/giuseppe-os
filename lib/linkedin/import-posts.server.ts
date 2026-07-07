import { upsertKnowledgeCandidate } from '../../src/modules/knowledge/services/knowledge-persistence.server';
import { fetchLinkedInPostMetadata } from './fetch-post-metadata.server';

export type LinkedInImportResult = {
  url: string;
  activityId: string;
  title: string;
  created: boolean;
  knowledgeId: string;
};

export async function importLinkedInPosts(urls: string[]): Promise<{
  imported: LinkedInImportResult[];
  errors: Array<{ url: string; message: string }>;
}> {
  const imported: LinkedInImportResult[] = [];
  const errors: Array<{ url: string; message: string }> = [];

  for (const rawUrl of urls) {
    const url = rawUrl.trim();
    if (!url) {
      continue;
    }

    try {
      const meta = await fetchLinkedInPostMetadata(url);
      const evidenceId = `evidence_linkedin_manual_${meta.activityId.replace(/[^a-zA-Z0-9]+/g, '_')}`;
      const label = meta.title.slice(0, 120) || `LinkedIn post ${meta.activityId}`;

      const result = await upsertKnowledgeCandidate({
        owner: 'giuseppe',
        sourceId: 'linkedin_personal',
        sourceType: 'social',
        candidate: {
          knowledgeType: 'statement',
          label,
          summary: meta.description.slice(0, 500),
          confidence: 0.82,
          evidenceId,
          evidenceUrl: meta.url,
          metadata: {
            extractor: 'linkedin-manual-og',
            activityId: meta.activityId,
            importMode: 'manual_og',
            fullTitle: meta.title
          }
        },
        status: 'active'
      });

      imported.push({
        url: meta.url,
        activityId: meta.activityId,
        title: meta.title,
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
