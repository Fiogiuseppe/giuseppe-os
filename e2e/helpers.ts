import type { Page } from '@playwright/test';

export type AppView = 'today' | 'decisions' | 'insights' | 'create' | 'memory';

export async function gotoView(page: Page, view: AppView) {
  await page.getByTestId(`nav-${view}`).click();
}

export const FOOTER_PATTERN =
  /partner decisionale di cui ti fidi|decision partner you trust most/i;

export const VIEW_HEADING_PATTERNS: Record<AppView, RegExp> = {
  today: /COSA HA MASSIMA LEVA|HIGHEST LEVERAGE TODAY/i,
  decisions: /MIGLIORE DECISIONE|BEST DECISION I CAN MAKE/i,
  insights: /COSA NON STO VEDENDO|WHAT AM I NOT SEEING/i,
  create: /MERITA LA MIA ENERGIA|DESERVES MY ENERGY/i,
  memory: /CONTINUARE A ESSERE|CONTINUE BEING/i
};

export const DECISION_SUBMIT_PATTERN = /Simula e raccomanda|Simulate & recommend/i;
