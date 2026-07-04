export type ContentSourceType = 'decision' | 'insight' | 'pattern' | 'freeform';

export type ContentFormat = 'medium' | 'linkedin' | 'instagram-story';

export type GatherSourceMaterialInput = {
  sourceType: ContentSourceType;
  sourceId?: string;
  topic?: string;
};

export type SourceMaterial = {
  sourceType: ContentSourceType;
  title: string;
  summary: string;
  body: string;
  metadata: Record<string, string | number | null | undefined>;
};

export type ContentGenerateRequest = {
  sourceType: ContentSourceType;
  sourceId?: string;
  topic?: string;
  formats: ContentFormat[];
};

export type ContentGenerateResponse = {
  source: 'mock' | 'live';
  medium?: string;
  linkedin?: string;
  instagramStory?: string[];
};
