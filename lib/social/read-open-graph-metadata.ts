import { decodeHtmlEntities } from './decode-html-entities';

function readAttributeContent(tag: string, attribute: string): string {
  const pattern = new RegExp(`${attribute}\\s*=\\s*["']([\\s\\S]*?)["']`, 'i');
  return tag.match(pattern)?.[1]?.trim() ?? '';
}

function readMetaTagContent(html: string, key: string, attribute: 'property' | 'name'): string {
  const head = html.slice(0, Math.min(html.length, 120_000));
  const tagPattern = new RegExp(`<meta\\b[^>]*\\b${attribute}=["']${key}["'][^>]*>`, 'gi');
  const tag = tagPattern.exec(head)?.[0];
  if (!tag) {
    return '';
  }

  return decodeHtmlEntities(readAttributeContent(tag, 'content'));
}

export function readOpenGraphMetadata(
  html: string,
  keys: string[]
): Record<string, string> {
  const result: Record<string, string> = {};

  for (const key of keys) {
    const byProperty = readMetaTagContent(html, key, 'property');
    const byName = readMetaTagContent(html, key, 'name');
    const value = byProperty || byName;
    if (value) {
      result[key] = value;
    }
  }

  return result;
}
