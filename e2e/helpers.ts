import type { Page } from '@playwright/test';

export type AppView = 'today' | 'decisions' | 'discover' | 'create' | 'memory';

export async function gotoView(page: Page, view: AppView) {
  await page.getByTestId(`nav-${view}`).click();
}

export const FOOTER_PATTERN =
  /software che ricorda chi hai scelto di diventare|software that remembers who you chose to become/i;

export const VIEW_HEADING_PATTERNS: Record<AppView, RegExp> = {
  today: /IL MIGLIOR PASSO DI OGGI|TODAY'S BEST MOVE/i,
  decisions: /PROGETTARE UNA VITA|DESIGN A LIFE THAT SETS ME FREE/i,
  discover: /HO NOTATO QUALCOSA|I NOTICED SOMETHING/i,
  create: /IL SISTEMA GIUSEPPE|THE GIUSEPPE SYSTEM/i,
  memory: /CHI HO SCELTO DI DIVENTARE|WHO I CHOSE TO BECOME/i
};
