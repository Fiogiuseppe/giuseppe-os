import { test, expect } from '@playwright/test';
import {
  SOURCE_PROVIDER_IDS,
  getOfficialSourceUrl,
  getSourceConfig,
  listSourceConfigs,
  normalizeSourceId
} from '../src/modules/sources/config/source-config';

test.describe('Giuseppe OS Source Configuration — Phase 8', () => {
  test('all six official source configs exist', async () => {
    const configs = listSourceConfigs();
    expect(configs).toHaveLength(6);
    expect([...SOURCE_PROVIDER_IDS]).toEqual([
      'website_personal',
      'instagram_personal',
      'linkedin_personal',
      'medium_personal',
      'website_urees',
      'instagram_urees'
    ]);
  });

  test('LinkedIn URL is correct', async () => {
    expect(getOfficialSourceUrl('linkedin_personal')).toBe(
      'https://linkedin.com/in/fiogiuseppe/?skipRedirect=true'
    );
  });

  test('website_personal uses https://fiogiuseppe.com/', async () => {
    expect(getOfficialSourceUrl('website_personal')).toBe('https://fiogiuseppe.com/');
  });

  test('website_urees uses https://urees.shop/', async () => {
    expect(getOfficialSourceUrl('website_urees')).toBe('https://urees.shop/');
  });

  test('no canonical source uses urees-website as sourceId', async () => {
    for (const id of SOURCE_PROVIDER_IDS) {
      expect(id).not.toBe('urees-website');
    }

    expect(getSourceConfig('urees-website')?.id).toBe('website_urees');
    expect(normalizeSourceId('urees-website')).toBe('website_urees');
  });

  test('legacy website alias maps to website_personal', async () => {
    expect(normalizeSourceId('website')).toBe('website_personal');
  });
});
