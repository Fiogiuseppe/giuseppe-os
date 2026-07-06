import { UREES_PRESENCE } from '../canonical';
import { fetchText } from '../http';
import type { PresenceChannelReport, PresenceItem } from '../types';

type ShopifyProduct = {
  id: number;
  title: string;
  handle: string;
  body_html: string;
  created_at: string;
};

type ShopifyProductsResponse = {
  products: ShopifyProduct[];
};

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export async function fetchUreesShopPresence(limit = 5): Promise<{
  channel: PresenceChannelReport;
  items: PresenceItem[];
}> {
  const channel: PresenceChannelReport = {
    id: 'urees_website',
    label: UREES_PRESENCE.channels.website.label,
    url: UREES_PRESENCE.channels.website.profileUrl,
    status: 'active'
  };

  try {
    const productsUrl = `${UREES_PRESENCE.channels.website.productsUrl}?limit=${limit}`;
    const text = await fetchText(productsUrl);
    const data = JSON.parse(text) as ShopifyProductsResponse;

    const items: PresenceItem[] = [...data.products]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit)
      .map(product => ({
        id: `urees-product-${product.id}`,
        channel: 'urees_website',
        kind: 'product',
        title: product.title,
        summary: stripHtml(product.body_html).slice(0, 280),
        url: `${UREES_PRESENCE.channels.website.profileUrl}products/${product.handle}`,
        publishedAt: product.created_at
      }));

    return { channel, items };
  } catch (error) {
    return {
      channel: {
        ...channel,
        status: 'error',
        statusNote: error instanceof Error ? error.message : 'Shopify fetch failed'
      },
      items: []
    };
  }
}
