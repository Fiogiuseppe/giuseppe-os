import { runPotentialEngine } from '../../engine/potentialEngine';
import type { PotentialBrief } from '../../engine/potentialEngine';
import { isAILiveMode } from '../ai/mode';
import { runWithAICallMeta } from '../ai/callContext';
import { runExecutiveBrain } from '../brain/executiveBrain';
import { loadLongTermMemory, loadWorkingMemory } from '../brain/memory/store';
import type { AppLocale } from '../i18n/locale';
import { resolveLocale } from '../i18n/locale';
import { loadSelfModelSummary } from '../self-model/summary';

export type CreateBriefSource = 'local' | 'live';

export type CreateBriefResponse = {
  potential: PotentialBrief;
  source: CreateBriefSource;
};

export async function generateLocalCreateBrief(
  localeInput?: AppLocale
): Promise<CreateBriefResponse> {
  const locale = resolveLocale(localeInput);
  const [longTerm, working, selfModel] = await Promise.all([
    loadLongTermMemory(),
    loadWorkingMemory(),
    loadSelfModelSummary()
  ]);
  const potential = runPotentialEngine({ longTerm, working, locale, selfModelSummary: selfModel.text });

  return {
    potential,
    source: 'local'
  };
}

export async function generateLiveCreateBrief(
  localeInput?: AppLocale
): Promise<CreateBriefResponse> {
  if (!isAILiveMode()) {
    throw new Error('Live AI is disabled.');
  }

  const locale = resolveLocale(localeInput);
  const response = await runWithAICallMeta(
    { page: 'create', reason: 'explicit-analysis' },
    () =>
      runExecutiveBrain({
        intent: 'potential',
        message: 'Analyze where Giuseppe should focus creative energy today.',
        persist: false,
        locale
      })
  );

  if (!response.potentialBrief) {
    throw new Error('Create analysis returned no potential brief.');
  }

  return {
    potential: response.potentialBrief,
    source: 'live'
  };
}
