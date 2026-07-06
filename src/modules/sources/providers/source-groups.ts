import type { SourceProviderId } from './source-provider.types';

export type SourceGroupId = 'personal' | 'urees';

export type SourceGroup = {
  id: SourceGroupId;
  label: string;
  description: string;
  sourceIds: SourceProviderId[];
};

export const PERSONAL_GROUP: SourceGroup = {
  id: 'personal',
  label: 'Personal',
  description: 'Canonical personal public channels — @fiogiuseppe, Medium, fiogiuseppe.com.',
  sourceIds: ['instagram', 'linkedin', 'medium', 'website']
};

export const UREES_GROUP: SourceGroup = {
  id: 'urees',
  label: 'UREES',
  description: 'Brand project — @urees__ and urees.shop.',
  sourceIds: ['urees-instagram', 'urees-website']
};

/** Phase 1: Personal + UREES only. */
export const SOURCE_GROUPS: SourceGroup[] = [PERSONAL_GROUP, UREES_GROUP];

export function groupSources<T extends { id: SourceProviderId }>(
  sources: T[]
): Array<{ group: SourceGroup; sources: T[] }> {
  const byId = new Map(sources.map(source => [source.id, source]));

  return SOURCE_GROUPS.map(group => ({
    group,
    sources: group.sourceIds
      .map(id => byId.get(id))
      .filter((source): source is T => Boolean(source))
  }));
}
