import type { RealityConnectorMeta, RealitySignal } from '../types';

export interface RealityConnector {
  meta: RealityConnectorMeta;
  collect(dateKey: string): Promise<RealitySignal[]>;
}
