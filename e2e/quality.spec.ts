import { test, expect } from '@playwright/test';

const NORTH_STAR = 'PROGETTARE UNA VITA CHE MI RENDA LIBERO DI CREARE CIÒ CHE CONTA.';
const FOOTER_MANIFESTO = "It's not software that tells you what to do. It's software that remembers who you chose to become.";

const MAIN_SECTIONS = [
  { label: 'Today', heading: /IL MIGLIOR PASSO DI OGGI/ },
  { label: 'Decisions', heading: /PROGETTARE UNA VITA CHE MI RENDA LIBERO DI CREARE CIÒ CHE CONTA/ },
  { label: 'Discover', heading: /I NOTICED SOMETHING/ },
  { label: 'Create', heading: /IL SISTEMA GIUSEPPE/ },
  { label: 'Memory', heading: /CHI HO SCELTO DI DIVENTARE/ }
] as const;

const BANNED_GENERIC_COPY = [
  /lorem ipsum/i,
  /click here/i,
  /welcome to your dashboard/i,
  /maximize your potential/i,
  /get started today/i
];

async function expectFooterManifesto(page: import('@playwright/test').Page) {
  const footer = page.locator('footer.footer');
  await expect(footer.getByText(FOOTER_MANIFESTO)).toBeVisible();
}

async function expectPrimaryHeading(page: import('@playwright/test').Page) {
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

    for (const { label, heading } of MAIN_SECTIONS) {
      await nav.getByRole('button', { name: label, exact: true }).click();
      await expect(page.getByRole('main')).toBeVisible();
      await expect(page.getByRole('main').locator('.view-title')).toContainText(heading);
    }
  });

  test('no main heading is missing on any section', async ({ page }) => {
    const nav = page.getByRole('navigation');

    for (const { label } of MAIN_SECTIONS) {
      await nav.getByRole('button', { name: label }).click();
      await expectPrimaryHeading(page);
    }
  });

  test('footer manifesto stays visible across navigation', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    const nav = page.getByRole('navigation');

    await expectFooterManifesto(page);

    for (const { label } of MAIN_SECTIONS) {
      await nav.getByRole('button', { name: label }).click();
      await expectFooterManifesto(page);
    }
  });

  test('decision form works end to end', async ({ page }) => {
    await page.getByRole('navigation').getByRole('button', { name: 'Decisions' }).click();

    await page.getByPlaceholder('Es. comprare casa, pubblicare un post, investire...').fill('investire in ETF');
    await page.getByPlaceholder('Motivo vero.').fill('Voglio comprare libertà futura.');
    await page.getByRole('button', { name: 'Chiedi al Board' }).click();

    await expect(page.locator('.result')).toBeVisible();
    await expect(page.getByText('Prossimo passo')).toBeVisible();
    await expectFooterManifesto(page);
  });

  test('awareness section works when present', async ({ page }) => {
    const discoverButton = page.getByRole('navigation').getByRole('button', { name: 'Discover' });
    await expect(discoverButton).toBeVisible();

    await discoverButton.click();
    await expect(page.getByRole('main').locator('.view-title')).toHaveText('I NOTICED SOMETHING.');
    await expect(page.getByRole('heading', { name: /Stai portando|Hai liquidità|Il lavoro sacro|Vuoi visibilità|LEGO è il motore/ })).toBeVisible();
    await page.getByRole('button', { name: 'Suggested action' }).click();
    await expect(page.getByText('RECOMMENDED ACTION')).toBeVisible();
    await expect(page.locator('.potential-score')).toBeVisible();
  });

  test('navigation completes without page crashes', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));

    const nav = page.getByRole('navigation');
    for (const { label } of MAIN_SECTIONS) {
      await nav.getByRole('button', { name: label }).click();
      await expect(page.getByRole('main')).toBeVisible();
    }

    expect(errors).toEqual([]);
  });

  test('accessibility landmarks are present', async ({ page }) => {
    await expect(page.getByRole('navigation')).toBeVisible();
    await expect(page.getByRole('main')).toBeVisible();
    await expect(page.locator('footer.footer')).toBeVisible();
    await expect(page.getByRole('navigation').getByRole('button', { name: 'Decisions', exact: true })).toBeVisible();
  });

  test('visual hierarchy uses kickers before headlines', async ({ page }) => {
    const nav = page.getByRole('navigation');

    for (const { label } of MAIN_SECTIONS) {
      await nav.getByRole('button', { name: label }).click();
      await expect(page.getByRole('main').locator('.kicker').first()).toBeVisible();
    }
  });

  test('only one navigation item is active at a time', async ({ page }) => {
    const nav = page.getByRole('navigation');

    for (const { label } of MAIN_SECTIONS) {
      await nav.getByRole('button', { name: label }).click();
      await expect(nav.locator('button.active')).toHaveCount(1);
    }
  });

  test('north star appears only on Decisions view', async ({ page }) => {
    await expect(page.getByRole('main').getByText(NORTH_STAR)).toHaveCount(0);

    const nav = page.getByRole('navigation');
    await nav.getByRole('button', { name: 'Decisions', exact: true }).click();
    await expect(page.getByRole('main').getByText(NORTH_STAR).first()).toBeVisible();

    for (const { label } of MAIN_SECTIONS) {
      if (label === 'Decisions') continue;
      await nav.getByRole('button', { name: label, exact: true }).click();
      await expect(page.getByRole('main').getByText(NORTH_STAR)).toHaveCount(0);
    }
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

    await expect(page.getByRole('button', { name: 'Giuseppe OS home' })).toBeVisible();
    await expect(page.locator('.companion-panel').first()).toBeVisible();
    await expect(page.locator('.topbar')).toBeVisible();
  });

  test('architecture-aligned north star appears on Decisions', async ({ page }) => {
    await page.getByRole('navigation').getByRole('button', { name: 'Decisions', exact: true }).click();
    await expect(page.getByRole('main').getByText(NORTH_STAR).first()).toBeVisible();
  });

  test('finance view hides sensitive personal numbers', async ({ page }) => {
    await page.getByRole('navigation').getByRole('button', { name: 'Discover', exact: true }).click();
    await page.getByRole('button', { name: 'Freedom & finance' }).click();
    await page.getByRole('button', { name: 'Financial details' }).click();

    const main = page.getByRole('main');
    await expect(main.getByText('CASH RESERVE')).toBeVisible();
    await expect(main.getByText('Hidden')).toBeVisible();
    await expect(main.locator('.privacy-blur').first()).toBeVisible();
    await expect(page.getByText('200000')).not.toBeVisible();
    await expect(page.getByText(/DKK/)).not.toBeVisible();
    await expect(page.getByText('stanza affittata')).not.toBeVisible();
  });
});

test.describe('Giuseppe OS quality loop — responsiveness', () => {
  test('mobile viewport keeps navigation and headings usable', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    const nav = page.getByRole('navigation');
    await expect(nav.getByRole('button', { name: 'Today' })).toBeVisible();

    for (const { label, heading } of MAIN_SECTIONS) {
      await nav.getByRole('button', { name: label, exact: true }).click();
      await expect(page.getByRole('main').locator('.view-title')).toContainText(heading);
    }
  });
});
