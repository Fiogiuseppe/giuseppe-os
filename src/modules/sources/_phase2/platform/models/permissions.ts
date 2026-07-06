import { getSourceProvider } from '../../providers/source-registry';
import type { SourceProviderId } from '../../providers/source-provider.types';

export type SourcePermissionModel = {
  sourceId: SourceProviderId;
  declared: string[];
  granted: string[];
};

export function buildPermissionModel(
  sourceId: SourceProviderId,
  granted: string[]
): SourcePermissionModel {
  const provider = getSourceProvider(sourceId);
  return {
    sourceId,
    declared: provider.permissions,
    granted: granted.filter(permission => provider.permissions.includes(permission))
  };
}

export function defaultGrantedPermissions(sourceId: SourceProviderId, limit = 3): string[] {
  const provider = getSourceProvider(sourceId);
  return provider.permissions.slice(0, Math.min(limit, provider.permissions.length));
}

export function grantAllDeclaredPermissions(sourceId: SourceProviderId): string[] {
  return [...getSourceProvider(sourceId).permissions];
}
