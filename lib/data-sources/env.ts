import { getDataSourceDefinition } from './sources';
import type { DataSourceId } from './types';

export function isEnvVarPresent(name: string): boolean {
  const value = process.env[name];
  return typeof value === 'string' && value.trim().length > 0;
}

export function getMissingEnvVars(source: DataSourceId): string[] {
  const definition = getDataSourceDefinition(source);
  return definition.requiredEnvVars.filter(name => !isEnvVarPresent(name));
}

export function isDataSourceConfigured(source: DataSourceId): boolean {
  if (source === 'manual_import') {
    return true;
  }

  return getMissingEnvVars(source).length === 0;
}
