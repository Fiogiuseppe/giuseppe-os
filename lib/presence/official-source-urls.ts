/**
 * @deprecated Import from `src/modules/sources/config/source-config.ts`.
 */
import {
  getOfficialSourceUrl,
  listSourceConfigs,
  SOURCE_PROVIDER_IDS,
  type SourceProviderId
} from '../../src/modules/sources/config/source-config';

export const OFFICIAL_SOURCE_URLS = Object.fromEntries(
  listSourceConfigs().map(config => [config.id, config.officialUrl])
) as Record<SourceProviderId, string>;

export type OfficialSourceUrlKey = SourceProviderId;

export { getOfficialSourceUrl };
