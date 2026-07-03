import type { RealityConnector } from './types';
import type { RealityDomain } from '../types';
import { personalContextConnector } from './personalContext';

function plannedConnector(
  id: string,
  label: string,
  domains: RealityDomain[]
): RealityConnector {
  return {
    meta: { id, label, status: 'planned', domains },
    async collect() {
      return [];
    }
  };
}

export const REALITY_CONNECTOR_REGISTRY: RealityConnector[] = [
  personalContextConnector,
  plannedConnector('ai_news', 'AI news', ['ai']),
  plannedConnector('design_news', 'Design news', ['design']),
  plannedConnector('lego_news', 'LEGO news', ['lego']),
  plannedConnector('technology_feed', 'Technology', ['technology']),
  plannedConnector('creativity_feed', 'Creativity', ['creativity']),
  plannedConnector('business_feed', 'Business', ['business']),
  plannedConnector('economy_feed', 'Economy', ['economy']),
  plannedConnector('art_feed', 'Art', ['art']),
  plannedConnector('photography_feed', 'Photography', ['photography']),
  plannedConnector('science_feed', 'Science', ['science']),
  plannedConnector('psychology_feed', 'Psychology', ['psychology']),
  plannedConnector('books_feed', 'Books', ['books']),
  plannedConnector('social_trends_feed', 'Social trends', ['social_trends']),
  plannedConnector('calendar', 'Calendar', ['personal']),
  plannedConnector('weather', 'Weather', ['personal'])
];

export function registerRealityConnector(connector: RealityConnector): void {
  const index = REALITY_CONNECTOR_REGISTRY.findIndex(item => item.meta.id === connector.meta.id);
  if (index >= 0) {
    REALITY_CONNECTOR_REGISTRY[index] = connector;
    return;
  }
  REALITY_CONNECTOR_REGISTRY.push(connector);
}
