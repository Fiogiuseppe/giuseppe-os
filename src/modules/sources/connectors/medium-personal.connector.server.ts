import { requireSourceConfig } from '../config/source-config';
import { createMediumConnector } from './medium/create-medium-connector.server';
import type { MediumConnectorConfig } from './medium/medium-connector.config.types';

export function resolveMediumPersonalConfig(): MediumConnectorConfig {
  const source = requireSourceConfig('medium_personal');

  return {
    sourceId: source.id,
    connectorId: source.connectorId ?? source.id,
    label: source.label,
    owner: source.owner ?? 'fiogiuseppe',
    sourceLabel: source.sourceLabel ?? 'medium.com',
    profileUrl: source.officialUrl,
    feedUrl: source.feedUrl ?? 'https://medium.com/feed/@fiogiuseppe',
    maxArticles: 12
  };
}

/** Phase 9 — real public Medium RSS connector for @fiogiuseppe. */
export const mediumPersonalConnector = createMediumConnector(resolveMediumPersonalConfig());
