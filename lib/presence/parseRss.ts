export type RssItem = {
  title: string;
  link: string;
  guid: string;
  pubDate: string;
  description: string;
  creator?: string;
  categories: string[];
};

function decodeXmlEntities(value: string): string {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function readTag(block: string, tag: string): string {
  const cdata = block.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`, 'i'));
  if (cdata?.[1]) {
    return decodeXmlEntities(cdata[1].trim());
  }

  const plain = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
  return plain?.[1] ? decodeXmlEntities(plain[1].trim()) : '';
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function parseRssItems(xml: string, limit = 8): RssItem[] {
  const items: RssItem[] = [];
  const itemRegex = /<item\b[\s\S]*?<\/item>/gi;
  let match: RegExpExecArray | null;

  while ((match = itemRegex.exec(xml)) !== null && items.length < limit) {
    const block = match[0];
    const title = readTag(block, 'title');
    const link = readTag(block, 'link');
    if (!title || !link) {
      continue;
    }

    const categories = Array.from(block.matchAll(/<category[^>]*>([\s\S]*?)<\/category>/gi)).map(item =>
      decodeXmlEntities(item[1].trim())
    );

    items.push({
      title,
      link,
      guid: readTag(block, 'guid') || link,
      pubDate: readTag(block, 'pubDate') || readTag(block, 'updated') || new Date().toISOString(),
      description: stripHtml(readTag(block, 'description') || readTag(block, 'content:encoded')),
      creator: readTag(block, 'dc:creator') || readTag(block, 'author'),
      categories
    });
  }

  return items;
}

export function parseRssChannelDescription(xml: string): string {
  return readTag(xml, 'description');
}
