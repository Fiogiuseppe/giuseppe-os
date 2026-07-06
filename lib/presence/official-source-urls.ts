/**
 * Official public source URLs — single registry for future connector configuration.
 * Do not invent or guess URLs; only add operator-confirmed endpoints here.
 */
export const OFFICIAL_SOURCE_URLS = {
  website_personal: 'https://fiogiuseppe.com/',
  instagram_personal: 'https://instagram.com/fiogiuseppe',
  instagram_urees: 'https://www.instagram.com/urees__/',
  linkedin_personal: 'https://linkedin.com/in/fiuseppe/?skipRedirect=true',
  medium_personal: 'https://medium.com/@fiogiuseppe',
  website_urees: 'https://urees.shop/'
} as const;

export type OfficialSourceUrlKey = keyof typeof OFFICIAL_SOURCE_URLS;
