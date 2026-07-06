import { createStubConnector } from './stub';
import type { DataSourceId, SourceConnector } from '../types';

const CONNECTOR_BUILDERS: Record<DataSourceId, () => SourceConnector> = {
  instagram: () =>
    createStubConnector('instagram', {
      capabilities: { canReadPosts: true, canReadComments: true, canReadMetrics: true }
    }),
  linkedin: () =>
    createStubConnector('linkedin', {
      capabilities: { canReadPosts: true, canReadComments: true, canReadMetrics: true }
    }),
  calendar: () =>
    createStubConnector('calendar', {
      capabilities: { canReadPosts: true, canReadComments: false, canReadMetrics: false }
    }),
  gmail: () =>
    createStubConnector('gmail', {
      capabilities: { canReadPosts: true, canReadComments: false, canReadMetrics: false }
    }),
  github: () =>
    createStubConnector('github', {
      capabilities: { canReadPosts: true, canReadComments: true, canReadMetrics: false }
    }),
  health: () =>
    createStubConnector('health', {
      capabilities: { canReadPosts: true, canReadComments: false, canReadMetrics: true }
    }),
  books: () =>
    createStubConnector('books', {
      capabilities: { canReadPosts: true, canReadComments: false, canReadMetrics: false }
    }),
  spotify: () =>
    createStubConnector('spotify', {
      capabilities: { canReadPosts: true, canReadComments: false, canReadMetrics: true }
    }),
  figma: () =>
    createStubConnector('figma', {
      capabilities: { canReadPosts: true, canReadComments: true, canReadMetrics: false }
    }),
  manual_import: () => createStubConnector('manual_import')
};

let registry: Map<DataSourceId, SourceConnector> | null = null;

function buildRegistry(): Map<DataSourceId, SourceConnector> {
  const map = new Map<DataSourceId, SourceConnector>();
  for (const [source, builder] of Object.entries(CONNECTOR_BUILDERS) as Array<
    [DataSourceId, () => SourceConnector]
  >) {
    map.set(source, builder());
  }
  return map;
}

export function getSourceConnector(source: DataSourceId): SourceConnector {
  if (!registry) {
    registry = buildRegistry();
  }

  const connector = registry.get(source);
  if (!connector) {
    throw new Error(`No connector registered for source: ${source}`);
  }

  return connector;
}

export function listSourceConnectors(): SourceConnector[] {
  if (!registry) {
    registry = buildRegistry();
  }

  return Array.from(registry.values());
}

export function resetSourceConnectorRegistryForTests(): void {
  registry = null;
}
