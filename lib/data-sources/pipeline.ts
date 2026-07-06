export const DATA_SOURCE_PIPELINE = [
  'source',
  'normalize',
  'analyze',
  'evidence',
  'self_model'
] as const;

export const DATA_SOURCE_PIPELINE_DESCRIPTION =
  'Source → Normalize → Analyze → Evidence → Self Model';
