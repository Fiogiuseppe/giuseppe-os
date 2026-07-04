import { expect, type Page } from '@playwright/test';

export type AppView = 'today' | 'decisions' | 'insights' | 'create' | 'memory';

export async function gotoView(page: Page, view: AppView) {
  await page.getByTestId(`nav-${view}`).click();
}

export const FOOTER_PATTERN = /About/i;

export const VIEW_HEADING_PATTERNS: Record<AppView, RegExp> = {
  today: /./, // Today shows action only — no page heading
  decisions: /MIGLIORE DECISIONE|BEST DECISION I CAN MAKE/i,
  insights: /COSA NON STO VEDENDO|WHAT AM I NOT SEEING/i,
  create: /MERITA LA MIA ENERGIA|DESERVES MY ENERGY/i,
  memory: /CONTINUARE A ESSERE|CONTINUE BEING/i
};

export async function expectTodayActionVisible(page: Page) {
  const action = page.getByTestId('today-action');
  await expect(action).toBeVisible();
  await expect(action.locator('.today-action-text')).not.toBeEmpty({ timeout: 15_000 });
}

export const DECISION_SUBMIT_PATTERN = /Simula e raccomanda|Simulate & recommend/i;
