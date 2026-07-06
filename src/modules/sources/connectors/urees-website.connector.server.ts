import { createWebsiteConnector } from './website/create-website-connector.server';
import { resolveUreesWebsiteConfig } from './website/website-connector.configs.server';

/** Phase 7 — configurable UREES public website connector. */
export const ureesWebsiteConnector = createWebsiteConnector(resolveUreesWebsiteConfig());

export { resolveUreesWebsiteConfig } from './website/website-connector.configs.server';
