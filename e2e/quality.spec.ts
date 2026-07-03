import { test, expect } from '@playwright/test';

const NORTH_STAR = 'PROGETTARE UNA VITA CHE MI RENDA LIBERO DI CREARE CIÒ CHE CONTA.';
const FOOTER_LINE_1 = "It's not software that tells you what to do.";
const FOOTER_LINE_2 = "It's software that remembers who you chose to become.";

const MAIN_SECTIONS = [
  { label: 'Home', heading: /GIUSEPPE OS/ },
  { label: 'Board', heading: /PROGETTARE UNA VITA CHE MI RENDA LIBERO DI CREARE CIÒ CHE CONTA/ },
  { label: 'Today', heading: /UN PASSO ALLA VOLTA VERSO LA LIBERTÀ/ },
  { label: 'Projects', heading: /IL SISTEMA GIUSEPPE/ },
  { label: 'Finance', heading: /COMPRA LIBERTÀ, NON STATUS/ },
  { label: 'Awareness', heading: /I NOTICED SOMETHING/ },
  { label: 'Brain', heading: /CHI HO SCELTO DI DIVENTARE/ }
] as const;

const BANNED_GENERIC_COPY = [
  /lorem ipsum/i,
  /click here/i,
  /welcome to your dashboard/i,
  /maximize your potential/i,
  /get started today/i
];

async function expectFooterManifesto(page: import('@playwright/test').Page) {
  await expect(page.getByText(FOOTER_LINE_1)).toBeVisible();
  await expect(page.getByText(FOOTER_LINE_2)).toBeVisible();
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
    const nav = page.getByRole('navigation');

    await expectFooterManifesto(page);

    for (const { label } of MAIN_SECTIONS) {
      await nav.getByRole('button', { name: label }).click();
      await expectFooterManifesto(page);
    }
  });

  test('decision form works end to end', async ({ page }) => {
    await page.getByRole('navigation').getByRole('button', { name: 'Today' }).click();

    await page.getByPlaceholder('Es. comprare casa, pubblicare un post, investire...').fill('investire in ETF');
    await page.getByPlaceholder('Motivo vero.').fill('Voglio comprare libertà futura.');
    await page.getByRole('button', { name: 'Chiedi al Board' }).click();

    await expect(page.locator('.result')).toBeVisible();
    await expect(page.getByText('Prossimo passo')).toBeVisible();
    await expectFooterManifesto(page);
  });

  test('awareness section works when present', async ({ page }) => {
    const awarenessButton = page.getByRole('navigation').getByRole('button', { name: 'Awareness' });
    await expect(awarenessButton).toBeVisible();

    await awarenessButton.click();
    await expect(page.getByRole('main').locator('.view-title')).toHaveText('I NOTICED SOMETHING.');
    await expect(page.getByRole('heading', { name: /Stai portando|Hai liquidità|Il lavoro sacro|Vuoi visibilità|LEGO è il motore/ })).toBeVisible();
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
    await expect(page.getByRole('navigation').getByRole('button', { name: 'Board', exact: true })).toBeVisible();
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

  test('north star appears only on Home and Board views', async ({ page }) => {
    await expect(page.getByRole('main').getByText(NORTH_STAR)).toHaveCount(1);

    const nav = page.getByRole('navigation');
    for (const { label } of MAIN_SECTIONS) {
      if (label === 'Home' || label === 'Board') continue;
      await nav.getByRole('button', { name: label }).click();
      await expect(page.getByRole('main').getByText(NORTH_STAR)).toHaveCount(0);
    }
  });

  test('no overly generic copy on the page', async ({ page }) => {
    const bodyText = await page.locator('body').textContent();

    for (const pattern of BANNED_GENERIC_COPY) {
      expect(bodyText).not.toMatch(pattern);
    }
  });

  test('dark dashboard visual identity is preserved', async ({ page }) => {
    const bodyBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    expect(bodyBg).toBe('rgb(7, 11, 20)');

    await expect(page.getByText('GIUSEPPE OS').first()).toBeVisible();
    await expect(page.locator('.card').first()).toBeVisible();
    await expect(page.locator('.sidebar')).toBeVisible();
  });

  test('architecture-aligned north star appears on Home', async ({ page }) => {
    await expect(page.getByRole('main').getByText(NORTH_STAR)).toBeVisible();
  });

  test('finance view hides sensitive personal numbers', async ({ page }) => {
    await page.getByRole('navigation').getByRole('button', { name: 'Finance' }).click();

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
    await expect(nav.getByRole('button', { name: 'Home' })).toBeVisible();

    for (const { label, heading } of MAIN_SECTIONS) {
      await nav.getByRole('button', { name: label, exact: true }).click();
      await expect(page.getByRole('main').locator('.view-title')).toContainText(heading);
      await expectFooterManifesto(page);
    }
  });
});
