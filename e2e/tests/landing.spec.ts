import { test, expect, type Locator, type Page } from '@playwright/test';

async function tabTo(page: Page, target: Locator): Promise<void> {
  for (let i = 0; i < 30; i++) {
    await page.keyboard.press('Tab');
    if (await target.evaluate((el) => el === document.activeElement)) return;
  }
  throw new Error('Tab never reached the element');
}

// Material's ring is the ::before of the button's own .mat-focus-indicator span
const ringOf = (button: Locator) =>
  button.evaluate((el) => {
    const s = getComputedStyle(el.querySelector('.mat-focus-indicator')!, '::before');
    return {
      display: s.display,
      content: s.content,
      width: s.borderTopWidth,
      style: s.borderTopStyle,
      color: s.borderTopColor,
      marginTop: s.marginTop,
    };
  });

const outlineOf = (link: Locator) =>
  link.evaluate((el) => {
    const s = getComputedStyle(el);
    return { style: s.outlineStyle, width: s.outlineWidth, color: s.outlineColor, offset: s.outlineOffset };
  });

test.describe('landing page', () => {
  test('shows the hero heading and the three photos at /', async ({ page }) => {
    await page.goto('/');

    await expect(
      page.getByRole('heading', { name: 'Remember every cup worth remembering.' }),
    ).toBeVisible();
    await expect(page.getByAltText('Hot water poured')).toBeVisible();
    await expect(page.getByAltText('Close-up of freshly roasted coffee beans')).toBeVisible();
    await expect(page.getByAltText('A cup of black coffee beside a leather notebook')).toBeVisible();
  });

  test('opens the journal from the hero button', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('link', { name: 'Open my journal' }).first().click();

    await expect(page).toHaveURL(/\/journal$/);
  });

  test('scrolls to the how-it-works section from the hero link', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('link', { name: 'How it works' }).click();

    await expect(
      page.getByRole('heading', { name: 'Brew. Log. Rediscover.' }),
    ).toBeInViewport();
  });

  test('redirects an unknown path to the landing page', async ({ page }) => {
    await page.goto('/no-such-page');

    await expect(page).toHaveURL(/\/$/);
    await expect(
      page.getByRole('heading', { name: 'Remember every cup worth remembering.' }),
    ).toBeVisible();
  });

  test('shows ivory focus rings in the hero and a terracotta one below it (R45)', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'R45 is specified at 1440 px');
    const ivory = 'rgb(250, 246, 238)';
    const terracotta = 'rgb(180, 83, 42)';
    await page.goto('/');

    const brand = page.locator('.hero-nav a.brand');
    await tabTo(page, brand);
    expect(await outlineOf(brand)).toEqual({ style: 'solid', width: '2px', color: ivory, offset: '2px' });

    const journal = page.locator('.hero-nav a.nav-link');
    await tabTo(page, journal);
    expect(await outlineOf(journal)).toEqual({ style: 'solid', width: '2px', color: ivory, offset: '2px' });

    const openJournal = page.locator('.hero .ctas a', { hasText: 'Open my journal' });
    await tabTo(page, openJournal);
    expect(await ringOf(openJournal)).toEqual({
      display: 'block',
      content: '""',
      width: '2px',
      style: 'solid',
      color: ivory,
      marginTop: '-4px',
    });
    expect(await openJournal.evaluate((el) => getComputedStyle(el).outlineStyle)).toBe('none');

    const howItWorks = page.locator('.hero .ctas a', { hasText: 'How it works' });
    await tabTo(page, howItWorks);
    expect(await ringOf(howItWorks)).toEqual({
      display: 'block',
      content: '""',
      width: '2px',
      style: 'solid',
      color: ivory,
      marginTop: '-5px',
    });
    expect(await howItWorks.evaluate((el) => getComputedStyle(el).outlineStyle)).toBe('none');

    const closing = page.locator('.closing a');
    await tabTo(page, closing);
    expect(await ringOf(closing)).toEqual({
      display: 'block',
      content: '""',
      width: '2px',
      style: 'solid',
      color: terracotta,
      marginTop: '-4px',
    });
  });

  test('shows no focus ring after a mouse click on How it works (R45)', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'R45 is specified at 1440 px');
    await page.goto('/');

    const howItWorks = page.locator('.hero .ctas a', { hasText: 'How it works' });
    await howItWorks.click();

    expect((await ringOf(howItWorks)).content).toBe('none');
  });
});
