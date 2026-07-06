import type { SelfModelDimensionKey, SelfModel } from '../self-model/types';
import { loadSelfModel, saveSelfModel } from '../self-model/store';
import { refreshDimensionEstimates } from '../self-model/estimate';
import type { EvidenceItem } from './types';

function appendEvidenceFromSource(
  model: SelfModel,
  dimensionKey: SelfModelDimensionKey,
  evidence: EvidenceItem,
  now: string
): void {
  const current = model.dimensions[dimensionKey];
  const source = `evidence:${evidence.attribution}`;
  const alreadyRecorded = current.evidence_sources.includes(source);

  const evidence_sources = alreadyRecorded
    ? current.evidence_sources
    : [...current.evidence_sources, source].slice(-30);

  const note = `[${evidence.source}] ${evidence.summary}`;
  const notes = current.notes.includes(note) ? current.notes : [...current.notes, note].slice(-20);

  model.dimensions[dimensionKey] = refreshDimensionEstimates({
    ...current,
    evidence_count: alreadyRecorded ? current.evidence_count : current.evidence_count + 1,
    last_updated: now,
    evidence_sources,
    notes
  });
}

export async function applyEvidenceToSelfModel(evidenceItems: EvidenceItem[]): Promise<void> {
  if (evidenceItems.length === 0) {
    return;
  }

  const model = await loadSelfModel();
  const now = new Date().toISOString();

  for (const evidence of evidenceItems) {
    const dimensions =
      evidence.dimensionHints.length > 0
        ? evidence.dimensionHints
        : (['alignment_with_future_self'] as SelfModelDimensionKey[]);

    for (const dimensionKey of dimensions) {
      appendEvidenceFromSource(model, dimensionKey, evidence, now);
    }
  }

  model.updatedAt = now;
  await saveSelfModel(model);
}
