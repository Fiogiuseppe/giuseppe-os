import type { SelfModel } from './types';
import { createEmptySelfModel } from './dimensions';

let selfModelMemory: SelfModel = createEmptySelfModel();

export function loadSelfModelFromMemory(): SelfModel {
  return structuredClone(selfModelMemory);
}

export function saveSelfModelToMemory(model: SelfModel): void {
  selfModelMemory = structuredClone(model);
}

export function resetSelfModelForTests(): void {
  selfModelMemory = createEmptySelfModel();
}
