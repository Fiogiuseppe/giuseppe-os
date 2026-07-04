import { test, expect } from '@playwright/test';
import { FOOTER_PATTERN, VIEW_HEADING_PATTERNS, gotoView, DECISION_SUBMIT_PATTERN, expectTodayActionVisible, completeDecisionConversation, richDecision, type AppView } from './helpers';

const NORTH_STAR = 'PROGETTARE UNA VITA CHE MI RENDA LIBERO DI CREARE CIÒ CHE CONTA.';

const MAIN_SECTIONS = [
  { id: 'today' as const, heading: VIEW_HEADING_PATTERNS.today },
  { id: 'decisions' as const, heading: VIEW_HEADING_PATTERNS.decisions },
  { id: 'insights' as const, heading: VIEW_HEADING_PATTERNS.insights },
  { id: 'create' as const, heading: VIEW_HEADING_PATTERNS.create },
  { id: 'memory' as const, heading: VIEW_HEADING_PATTERNS.memory }
] as const;

const BANNED_GENERIC_COPY = [
  /lorem ipsum/i,
  /click here/i,
  /welcome to your dashboard/i,
  /maximize your potential/i,
  /get started today/i
];

async function expectFooterManifesto(page: import('@playwright/test').Page) {
  await expect(page.locator('footer.footer')).toContainText(FOOTER_PATTERN);
}

async function expectPrimaryHeading(page: import('@playwright/test').Page, section: AppView) {
  if (section === 'today') {
    await expectTodayActionVisible(page);
    return;
  }

  const main = page.getByRole('main');
  const heading = main.locator('.view-title').first();
  await expect(heading).toBeVisible();
  const text = await heading.textContent();
  expect(text?.trim().length).toBeGreaterThan(0);
}

test.describe('Giuseppe OS quality loop', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('all main sections are reachable', async ({ page }) => {
    const nav = page.getByRole('navigation');

    for (const { id, heading } of MAIN_SECTIONS) {
      await nav.getByTestId(`nav-${id}`).click();
      await expect(page.getByRole('main')).toBeVisible();
      if (id === 'today') {
        await expectTodayActionVisible(page);
      } else {
        await expect(page.getByRole('main').locator('.view-title')).toContainText(heading);
      }
    }
  });

  test('no main heading is missing on any section', async ({ page }) => {
    const nav = page.getByRole('navigation');

    for (const { id } of MAIN_SECTIONS) {
      await nav.getByTestId(`nav-${id}`).click();
      await expectPrimaryHeading(page, id);
    }
  });

  test('footer about link stays visible across navigation', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    const nav = page.getByRole('navigation');

    await expectFooterManifesto(page);

    for (const { id } of MAIN_SECTIONS) {
      await nav.getByTestId(`nav-${id}`).click();
      await expectFooterManifesto(page);
    }
  });

  test('decision conversation works end to end', async ({ page }) => {
    await gotoView(page, 'decisions');

    await completeDecisionConversation(
      page,
      richDecision('investire in ETF', 'Voglio comprare libertà futura.'),
      'Voglio comprare libertà futura.'
    );
    await expect(page.getByText(/Prossimo passo|NEXT STEP/i)).toBeVisible();
    await expectFooterManifesto(page);
  });

  test('insights section surfaces patterns on demand', async ({ page }) => {
    await gotoView(page, 'insights');
    await expect(page.getByRole('main').locator('.view-title')).toContainText(VIEW_HEADING_PATTERNS.insights);
    await expect(page.getByRole('heading', { name: /Stai portando|Hai liquidità|Il lavoro sacro|Vuoi visibilità|LEGO è il motore/ })).toBeVisible();
    await page.getByRole('button', { name: /Suggested action|Azione suggerita/i }).click();
    await expect(page.getByText('RECOMMENDED ACTION')).toBeVisible();
    await expect(page.locator('.potential-score')).toBeVisible();
  });

  test('navigation completes without page crashes', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));

    const nav = page.getByRole('navigation');
    for (const { id } of MAIN_SECTIONS) {
      await nav.getByTestId(`nav-${id}`).click();
      await expect(page.getByRole('main')).toBeVisible();
    }

    expect(errors).toEqual([]);
  });

  test('about page is reachable from footer', async ({ page }) => {
    await page.locator('footer.footer').getByRole('link', { name: 'About' }).click();
    await expect(page).toHaveURL(/\/about$/);
    await expect(page.getByRole('heading', { name: 'Giuseppe OS', level: 1 })).toBeVisible();
    await expect(page.getByText(/Your Operating Self\.|Il tuo Sé operativo\./)).toBeVisible();
    await expect(page.getByText('v0.1')).toBeVisible();
    await expect(page.getByText(/A lifelong project\.|Un progetto per tutta la vita\./)).toBeVisible();
  });

  test('accessibility landmarks are present', async ({ page }) => {
    await expect(page.getByRole('navigation')).toBeVisible();
    await expect(page.getByRole('main')).toBeVisible();
    await expect(page.locator('footer.footer')).toBeVisible();
    await expect(page.getByTestId('nav-decisions')).toBeVisible();
  });

  test('visual hierarchy uses kickers before headlines', async ({ page }) => {
    const nav = page.getByRole('navigation');

    for (const { id } of MAIN_SECTIONS) {
      if (id === 'today') continue;
      await nav.getByTestId(`nav-${id}`).click();
      await expect(page.getByRole('main').locator('.kicker').first()).toBeVisible();
    }
  });

  test('only one navigation item is active at a time', async ({ page }) => {
    const nav = page.getByRole('navigation');

    for (const { id } of MAIN_SECTIONS) {
      await nav.getByTestId(`nav-${id}`).click();
      await expect(nav.locator('button.active')).toHaveCount(1);
    }
  });

  test('north star page headline appears only on Decisions view', async ({ page }) => {
    const decisionsHeadline = page.locator('.view-title').filter({
      hasText: VIEW_HEADING_PATTERNS.decisions
    });
    await expect(decisionsHeadline).toHaveCount(0);

    const nav = page.getByRole('navigation');
    await nav.getByTestId('nav-decisions').click();
    await expect(decisionsHeadline).toBeVisible();

    for (const { id } of MAIN_SECTIONS) {
      if (id === 'decisions') continue;
      await nav.getByTestId(`nav-${id}`).click();
      await expect(decisionsHeadline).toHaveCount(0);
    }

    await nav.getByTestId('nav-memory').click();
    await expect(page.getByRole('heading', { name: 'NORTH STAR' })).toBeVisible();
  });

  test('no overly generic copy on the page', async ({ page }) => {
    const bodyText = await page.locator('body').textContent();

    for (const pattern of BANNED_GENERIC_COPY) {
      expect(bodyText).not.toMatch(pattern);
    }
  });

  test('portfolio-aligned visual identity is preserved', async ({ page }) => {
    const bodyBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    expect(bodyBg).toBe('rgb(247, 245, 232)');

    await expect(page.getByRole('link', { name: /Giuseppe OS home/i })).toBeVisible();
    await expect(page.getByTestId('today-action')).toBeVisible();
    await expect(page.locator('.topbar')).toBeVisible();
  });

  test('architecture-aligned north star appears on Decisions', async ({ page }) => {
    await gotoView(page, 'decisions');
    await page.getByRole('button', { name: /Explore purpose|Esplora il proposito/i }).click();
    await expect(page.getByRole('main').getByText(NORTH_STAR).first()).toBeVisible();
  });

  test('insights patterns disclosure works', async ({ page }) => {
    await gotoView(page, 'insights');
    await page.getByRole('button', { name: /Patterns|Pattern/i }).click();
    await expect(page.getByText(/PATTERN OSSERVATI|OBSERVED PATTERNS/i)).toBeVisible();
    await expect(page.getByRole('main').getByText(/dispersione|dispersion/i).first()).toBeVisible();
  });
});

test.describe('Giuseppe OS quality loop — responsiveness', () => {
  test('mobile viewport keeps navigation and headings usable', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    const nav = page.getByRole('navigation');
    await expect(nav.getByTestId('nav-today')).toBeVisible();

    for (const { id, heading } of MAIN_SECTIONS) {
      await nav.getByTestId(`nav-${id}`).click();
      if (id === 'today') {
        await expectTodayActionVisible(page);
      } else {
        await expect(page.getByRole('main').locator('.view-title')).toContainText(heading);
      }
    }
  });
});
