import { resetInMemoryDataSourceStoreForTests } from '../../../../lib/data-sources/store';
import { resetKnowledgeStoreForTests } from '../../../../src/modules/knowledge/store';
import { resetSourceEngineStoreForTests } from '../../../../src/modules/sources/platform/store';
import { resetAdapterRegistryForTests } from '../../../../src/modules/sources/platform/adapter-registry.server';
import { resetOAuthRegistryForTests } from '../../../../src/modules/sources/oauth/oauth-registry.server';
import { resetOAuthStateForTests } from '../../../../src/modules/sources/oauth/oauth-state.server';
import { resetTokenVaultStoreForTests } from '../../../../src/modules/sources/token-vault/token-vault-store.server';

function isTestRouteEnabled(): boolean {
  return process.env.ALLOW_TEST_ROUTES === '1' || process.env.NODE_ENV === 'test';
}

export async function POST() {
  if (!isTestRouteEnabled()) {
    return Response.json({ error: 'Not found.' }, { status: 404 });
  }

  await Promise.all([
    resetSourceEngineStoreForTests(),
    resetInMemoryDataSourceStoreForTests(),
    resetKnowledgeStoreForTests()
  ]);
  resetAdapterRegistryForTests();
  resetOAuthRegistryForTests();
  resetOAuthStateForTests();
  await resetTokenVaultStoreForTests();

  return Response.json({
    ok: true,
    reset: [
      'source_engine',
      'data_sources',
      'knowledge',
      'adapter_registry',
      'oauth_state',
      'oauth_registry',
      'token_vault'
    ]
  });
}
