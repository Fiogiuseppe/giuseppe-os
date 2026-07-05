export type MemoryMediaType = 'book' | 'podcast';

export type MemoryMediaCatalogItem = {
  id: string;
  type: MemoryMediaType;
  title: string;
  author: string;
  tags: string[];
};

export type MemoryMediaSuggestion = {
  id: string;
  type: MemoryMediaType;
  title: string;
  author: string;
  reason: string;
};

export type MemorySuggestionsResponse = {
  items: MemoryMediaSuggestion[];
  generatedAt: string;
  source: 'local';
};
