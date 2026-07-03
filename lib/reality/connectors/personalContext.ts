import { loadBrain } from '../../brain/memory/store';
import type { RealityConnector } from './types';
import type { RealitySignal } from '../types';

export const personalContextConnector: RealityConnector = {
  meta: {
    id: 'personal_context',
    label: 'Personal context',
    status: 'active',
    domains: ['personal', 'projects', 'finance']
  },
  async collect(dateKey) {
    const brain = await loadBrain();
    const observedAt = new Date().toISOString();
    const signals: RealitySignal[] = [];

    brain.priorities.forEach((priority, index) => {
      signals.push({
        id: `priority-${dateKey}-${index}`,
        domain: 'personal',
        headline: `Priorità: ${priority}`,
        summary: priority,
        sourceKind: 'personal_memory',
        connectorId: 'personal_context',
        reliability: 'high',
        observedAt
      });
    });

    brain.patterns.forEach((pattern, index) => {
      signals.push({
        id: `pattern-${dateKey}-${index}`,
        domain: 'personal',
        headline: `Pattern: ${pattern}`,
        summary: pattern,
        sourceKind: 'personal_memory',
        connectorId: 'personal_context',
        reliability: 'high',
        observedAt
      });
    });

    for (const [name, project] of Object.entries(brain.projects)) {
      if (project.status !== 'active' && project.status !== 'slow-active') {
        continue;
      }
      signals.push({
        id: `project-${dateKey}-${name}`,
        domain: 'projects',
        headline: `${name} (${project.status})`,
        summary: project.role,
        sourceKind: 'personal_memory',
        connectorId: 'personal_context',
        reliability: 'high',
        observedAt
      });
    }

    brain.finance.main_goals.forEach((goal, index) => {
      signals.push({
        id: `finance-${dateKey}-${index}`,
        domain: 'finance',
        headline: `Obiettivo finanziario: ${goal}`,
        summary: goal,
        sourceKind: 'personal_memory',
        connectorId: 'personal_context',
        reliability: 'high',
        observedAt
      });
    });

    return signals;
  }
};
