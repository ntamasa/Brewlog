import { execSync } from 'node:child_process';
import path from 'node:path';
import { test, expect, type Locator, type Page } from '@playwright/test';
import { uniqueName } from './support';

const repoRoot = path.resolve(__dirname, '..', '..');

// Desktop shows "+ Add brew" in the header, phone shows the FAB; the other one is hidden.
function addBrewTriggers(page: Page): { header: Locator; fab: Locator } {
  return {
    header: page.locator('.app-header button', { hasText: 'Add brew' }),
    fab: page.locator('button.mat-mdc-fab[aria-label="Add brew"]'),
  };
}

function isPhone(testName: string): boolean {
  return testName === 'phone';
}

test.describe('brew form', () => {
  test('logs a brew from the journal and keeps it after a backend restart', async ({
    page,
  }, testInfo) => {
    const name = uniqueName('Kenyan Morning');
    const { header, fab } = addBrewTriggers(page);
    await page.goto('/journal');
    await expect(page.getByRole('heading', { name: 'Your brews' })).toBeVisible();

    if (isPhone(testInfo.project.name)) {
      await expect(fab).toBeVisible();
      await expect(header).toBeHidden();
    } else {
      await expect(header).toBeVisible();
      await expect(fab).toBeHidden();
    }

    await (isPhone(testInfo.project.name) ? fab : header).click();
    const drawer = page.locator('mat-sidenav');
    await expect(drawer).toHaveClass(/mat-drawer-opened/);
    await expect(drawer.getByRole('heading', { name: 'Log a brew' })).toBeVisible();

    await drawer.getByLabel('Brew name', { exact: true }).fill(name);
    await drawer.getByLabel('Bean name', { exact: true }).fill('AA Kiambu');
    await drawer.getByLabel('Origin', { exact: true }).fill('Kenya');
    await drawer.getByRole('combobox').click();
    await page.getByRole('option', { name: 'Pour Over', exact: true }).click();
    await drawer.locator('mat-button-toggle', { hasText: 'Light' }).click();
    await drawer.getByRole('radiogroup', { name: 'Rating' }).locator('label').nth(4).click();
    await expect(drawer).toContainText('5 of 5');
    await drawer.getByRole('button', { name: 'Add to journal' }).click();

    await expect(page.getByText(`“${name}” saved to your journal`)).toBeVisible();
    await expect(drawer).not.toHaveClass(/mat-drawer-opened/);
    await expect(page.locator('app-brew-card h3', { hasText: name })).toBeVisible();

    execSync('docker compose restart backend', { cwd: repoRoot, stdio: 'pipe' });
    await expect
      .poll(async () => (await page.request.get('/api/brews')).status(), { timeout: 60_000 })
      .toBe(200);

    await page.reload();
    await expect(page.locator('app-brew-card h3', { hasText: name })).toBeVisible();
  });

  test('places the form drawer at the viewport edge when the journal is scrolled', async ({
    page,
  }, testInfo) => {
    await page.goto('/journal');
    await expect(page.getByRole('heading', { name: 'Your brews' })).toBeVisible();
    await page.addStyleTag({ content: 'main.container { min-height: 300vh; }' });
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(0);

    const header = await page.locator('.app-header').boundingBox();
    expect(header!.y).toBe(0);

    const phone = isPhone(testInfo.project.name);
    const { header: headerAdd, fab } = addBrewTriggers(page);
    await (phone ? fab : headerAdd).click();

    const drawer = page.locator('mat-sidenav');
    await expect(drawer.getByRole('heading', { name: 'Log a brew' })).toBeVisible();
    const viewport = page.viewportSize()!;
    const width = phone ? 390 : 520;
    await expect
      .poll(async () => {
        const box = await drawer.boundingBox();
        const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
        return box && {
          y: box.y,
          height: box.height,
          width: box.width,
          rightEdge: Math.round(box.x + box.width) === clientWidth,
        };
      })
      .toEqual({ y: 0, height: viewport.height, width, rightEdge: true });
  });
});
