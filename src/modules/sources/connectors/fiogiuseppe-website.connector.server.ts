import { createWebsiteConnector } from './website/create-website-connector.server';
import { resolveFiogiuseppeWebsiteConfig } from './website/website-connector.configs.server';

/** Phase 3 — real public fiogiuseppe.com connector via shared website architecture. */
export const fiogiuseppeWebsiteConnector = createWebsiteConnector(resolveFiogiuseppeWebsiteConfig());

export { FIOGIUSEPPE_WEBSITE_FEED_URLS } from './website/website-connector.configs.server';
