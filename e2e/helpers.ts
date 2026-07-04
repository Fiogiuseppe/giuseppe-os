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

export async function clickDecisionContinueWhenReady(page: Page) {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    if (await page.locator('.result').isVisible()) {
      return;
    }

    if (await page.getByText(/Sto ragionando|Reasoning/i).isVisible()) {
      await expect(page.locator('.result')).toBeVisible({ timeout: 30_000 });
      return;
    }

    const button = page.getByTestId('decision-continue');
    if ((await button.isVisible()) && (await button.isEnabled())) {
      await button.click();
      return;
    }

    await page.waitForTimeout(250);
  }

  if (await page.locator('.result').isVisible()) {
    return;
  }

  const button = page.getByTestId('decision-continue');
  await expect(button).toBeVisible({ timeout: 5_000 });
  await expect(button).toBeEnabled({ timeout: 5_000 });
  await button.click();
}

export function richDecision(decision: string, reason: string): string {
  return `${decision}. ${reason}. Non c'è urgenza reale. Sacrifico liquidità e tempo. Se sbaglio perdo mesi di runway.`;
}

export async function completeDecisionConversation(
  page: Page,
  decision: string,
  answer: string
) {
  await page.getByTestId('decision-open-input').fill(decision);
  await clickDecisionContinueWhenReady(page);

  for (let attempt = 0; attempt < 15; attempt += 1) {
    if (await page.locator('.result').isVisible()) {
      return;
    }

    if (await page.getByText(/Sto ragionando|Reasoning/i).isVisible()) {
      await expect(page.locator('.result')).toBeVisible({ timeout: 30_000 });
      return;
    }

    const followup = page.getByTestId('decision-followup-input');
    const continueBtn = page.getByTestId('decision-continue');

    if ((await followup.isVisible()) && (await continueBtn.isVisible())) {
      await followup.fill(answer);
      await clickDecisionContinueWhenReady(page);
      continue;
    }

    await page.waitForTimeout(300);
  }

  await expect(page.locator('.result')).toBeVisible({ timeout: 30_000 });
}

export const DECISION_CONTINUE_PATTERN = /Continua|Continue/i;
export const DECISION_SUBMIT_PATTERN = DECISION_CONTINUE_PATTERN;
