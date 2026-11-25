import { test, expect } from '@playwright/test';

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
});
