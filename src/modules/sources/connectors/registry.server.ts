import type { SourceProviderId } from '../providers/source-provider.types';
import type { SourceConnector } from './types';
import { fiogiuseppeWebsiteConnector } from './fiogiuseppe-website.connector.server';
import { ureesWebsiteConnector } from './urees-website.connector.server';

const CONNECTORS = new Map<SourceProviderId, SourceConnector>([
  ['website_personal', fiogiuseppeWebsiteConnector],
  ['website_urees', ureesWebsiteConnector]
]);

export function getSourceConnector(sourceId: SourceProviderId): SourceConnector | null {
  return CONNECTORS.get(sourceId) ?? null;
}

export function listRegisteredConnectors(): SourceConnector[] {
  return Array.from(CONNECTORS.values());
}

export function hasSourceConnector(sourceId: SourceProviderId): boolean {
  return CONNECTORS.has(sourceId);
}
