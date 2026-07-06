import { resetInMemoryStoreForTests } from '../memory/inMemoryStore';
import { resetSelfModelForTests } from '../self-model/inMemoryStore';
import { loadSelfModel } from '../self-model/store';
import { analyzeNormalizedItem } from './analyze';
import { getSourceConnector, listSourceConnectors } from './connectors/registry';
import { createEvidenceItem } from './evidence';
import { ingestFromSource, listConfiguredSources } from './ingest';
import { normalizeRawSourceItem } from './normalize';
import { DATA_SOURCE_PIPELINE } from './pipeline';
import { resetInMemoryDataSourceStoreForTests } from './store';
import type { RawSourceItem } from './types';

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

async function run(): Promise<void> {
  resetInMemoryStoreForTests();
  resetSelfModelForTests();
  resetInMemoryDataSourceStoreForTests();

  assert(DATA_SOURCE_PIPELINE.length === 5, 'pipeline should have five stages');
  assert(listSourceConnectors().length === 10, 'registry should expose ten connectors');

  const instagram = getSourceConnector('instagram');
  const instagramFetch = await instagram.fetch({ account: '@fiogiuseppe' });
  assert(instagramFetch.ok === false, 'instagram stub should fail without OAuth');
  if (!instagramFetch.ok) {
    assert(instagramFetch.code === 'not_configured', 'instagram should report not_configured');
  }

  const manualResult = await ingestFromSource('manual_import', 'giuseppe', {
    manualPayload: [
      {
        externalId: 'creative-note-1',
        rawJson: {
          content: 'Published UREES upcycling story on Instagram',
          caption: 'Design + sustainability for Brand Giuseppe',
          published_at: new Date().toISOString(),
          permalink: 'https://www.instagram.com/urees__/example',
          metrics: { likes: 42, comments: 3 }
        }
      }
    ]
  });

  assert(manualResult.fetched === 1, 'manual import should fetch one item');
  assert(manualResult.normalized === 1, 'manual import should normalize one item');
  assert(manualResult.evidence === 1, 'manual import should create one evidence item');
  assert(manualResult.errors.length === 0, 'manual import should not error');

  const selfModel = await loadSelfModel();
  assert(
    selfModel.dimensions.creative_energy.evidence_count > 0,
    'creative evidence should reach self model from manual import'
  );

  const raw: RawSourceItem = {
    id: 'raw_test',
    source: 'github',
    account: 'fiogiuseppe',
    externalId: 'commit-1',
    rawJson: {
      content: 'Ship giuseppe-os data sources foundation',
      published_at: new Date().toISOString(),
      permalink: 'https://github.com/Fiogiuseppe/giuseppe-os/commit/example'
    },
    fetchedAt: new Date().toISOString(),
    createdAt: new Date().toISOString()
  };

  const normalized = normalizeRawSourceItem(raw);
  assert(normalized.permalink.includes('github.com'), 'normalized item should keep permalink');

  const analysis = analyzeNormalizedItem(normalized);
  assert(analysis.dimensionHints.includes('execution'), 'github commit should hint execution');

  const evidence = createEvidenceItem(normalized, analysis);
  assert(evidence.attribution.startsWith('github:'), 'evidence must include source attribution');
  assert(evidence.traceId.includes('commit-1'), 'evidence must be traceable');

  const configured = listConfiguredSources();
  assert(configured.find(row => row.source === 'manual_import')?.configured === true, 'manual import configured');

  console.log('data-sources tests passed');
}

run().catch(error => {
  console.error(error);
  process.exit(1);
});
