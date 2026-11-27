import { execSync } from "node:child_process";
import path from "node:path";
import { test, expect, type Locator, type Page } from "@playwright/test";
import { uniqueName } from "./support";

const repoRoot = path.resolve(__dirname, "..", "..");

// Desktop shows "+ Add brew" in the header, phone shows the FAB; the other one is hidden.
function addBrewTriggers(page: Page): { header: Locator; fab: Locator } {
  return {
    header: page.locator(".app-header button", { hasText: "Add brew" }),
    fab: page.locator('button.mat-mdc-fab[aria-label="Add brew"]'),
  };
}

function isPhone(testName: string): boolean {
  return testName === "phone";
}

test.describe("brew form", () => {
  test("logs a brew from the journal and keeps it after a backend restart", async ({
    page,
  }, testInfo) => {
    const name = uniqueName("Kenyan Morning");
    const { header, fab } = addBrewTriggers(page);
    await page.goto("/journal");
    await expect(
      page.getByRole("heading", { name: "Your brews" }),
    ).toBeVisible();

    if (isPhone(testInfo.project.name)) {
      await expect(fab).toBeVisible();
      await expect(header).toBeHidden();
    } else {
      await expect(header).toBeVisible();
      await expect(fab).toBeHidden();
    }

    await (isPhone(testInfo.project.name) ? fab : header).click();
    const drawer = page.locator("mat-sidenav");
    await expect(drawer).toHaveClass(/mat-drawer-opened/);
    await expect(
      drawer.getByRole("heading", { name: "Log a brew" }),
    ).toBeVisible();

    await drawer.getByLabel("Brew name", { exact: true }).fill(name);
    await drawer.getByLabel("Bean name", { exact: true }).fill("AA Kiambu");
    await drawer.getByLabel("Origin", { exact: true }).fill("Kenya");
    await drawer.getByRole("combobox").click();
    await page.getByRole("option", { name: "Pour Over", exact: true }).click();
    await drawer.locator("mat-button-toggle", { hasText: "Light" }).click();
    await drawer
      .getByRole("radiogroup", { name: "Rating" })
      .locator("label")
      .nth(4)
      .click();
    await expect(drawer).toContainText("5 of 5");
    await drawer.getByRole("button", { name: "Add to journal" }).click();

    await expect(
      page.getByText(`“${name}” saved to your journal`),
    ).toBeVisible();
    await expect(drawer).not.toHaveClass(/mat-drawer-opened/);
    await expect(
      page.locator("app-brew-card h3", { hasText: name }),
    ).toBeVisible();

    execSync("docker compose restart backend", {
      cwd: repoRoot,
      stdio: "pipe",
    });
    await expect
      .poll(async () => (await page.request.get("/api/brews")).status(), {
        timeout: 60_000,
      })
      .toBe(200);

    await page.reload();
    await expect(
      page.locator("app-brew-card h3", { hasText: name }),
    ).toBeVisible();
  });

  test("places the form drawer at the viewport edge when the journal is scrolled", async ({
    page,
  }, testInfo) => {
    await page.goto("/journal");
    await expect(
      page.getByRole("heading", { name: "Your brews" }),
    ).toBeVisible();
    await page.addStyleTag({
      content: "main.container { min-height: 300vh; }",
    });
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(0);

    const header = await page.locator(".app-header").boundingBox();
    expect(header!.y).toBe(0);

    const phone = isPhone(testInfo.project.name);
    const { header: headerAdd, fab } = addBrewTriggers(page);
    await (phone ? fab : headerAdd).click();

    const drawer = page.locator("mat-sidenav");
    await expect(
      drawer.getByRole("heading", { name: "Log a brew" }),
    ).toBeVisible();
    const viewport = page.viewportSize()!;
    const width = phone ? 390 : 520;
    await expect
      .poll(async () => {
        const box = await drawer.boundingBox();
        const clientWidth = await page.evaluate(
          () => document.documentElement.clientWidth,
        );
        return (
          box && {
            y: box.y,
            height: box.height,
            width: box.width,
            rightEdge: Math.round(box.x + box.width) === clientWidth,
          }
        );
      })
      .toEqual({ y: 0, height: viewport.height, width, rightEdge: true });
  });

  test("draws outlined fields with labels above, hairline dividers and the method chevron", async ({
    page,
  }, testInfo) => {
    await page.goto("/journal");
    await expect(
      page.getByRole("heading", { name: "Your brews" }),
    ).toBeVisible();
    const { header, fab } = addBrewTriggers(page);
    await (isPhone(testInfo.project.name) ? fab : header).click();

    const drawer = page.locator("mat-sidenav");
    await expect(
      drawer.getByRole("heading", { name: "Log a brew" }),
    ).toBeVisible();

    const headBorder = await drawer
      .locator(".head")
      .evaluate((el) => getComputedStyle(el).borderBottom);
    expect(headBorder).toBe("1px solid rgb(220, 210, 195)");
    const footBorder = await drawer
      .locator(".foot")
      .evaluate((el) => getComputedStyle(el).borderTop);
    expect(footBorder).toBe("1px solid rgb(220, 210, 195)");

    const wrapper = drawer.locator(
      '[data-field="name"] .mat-mdc-text-field-wrapper',
    );
    const wrapperBackground = await wrapper.evaluate(
      (el) => getComputedStyle(el).backgroundColor,
    );
    expect(wrapperBackground).toBe("rgb(255, 253, 248)");
    const wrapperBox = await wrapper.boundingBox();
    expect(wrapperBox!.height).toBe(44);

    const label = await drawer.locator('label[for="name"]').boundingBox();
    expect(label!.y + label!.height).toBeLessThanOrEqual(wrapperBox!.y);
    await expect(drawer.locator(".mdc-floating-label")).toHaveCount(0);

    const arrow = drawer.locator(
      '[data-field="method"] .mat-mdc-select-arrow-wrapper',
    );
    expect(await arrow.evaluate((el) => getComputedStyle(el).display)).toBe(
      "none",
    );
    await expect(
      drawer.locator(
        '[data-field="method"] mat-icon[data-mat-icon-name="chevron-down"]',
      ),
    ).toBeVisible();
  });

  test("shows the method icon in the field, terracotta icons in the list and a bold selected option with a dot", async ({
    page,
  }, testInfo) => {
    await page.goto("/journal");
    await expect(
      page.getByRole("heading", { name: "Your brews" }),
    ).toBeVisible();
    const { header, fab } = addBrewTriggers(page);
    await (isPhone(testInfo.project.name) ? fab : header).click();

    const drawer = page.locator("mat-sidenav");
    await expect(
      drawer.getByRole("heading", { name: "Log a brew" }),
    ).toBeVisible();

    await drawer.getByRole("combobox").click();
    await page.getByRole("option", { name: "Pour Over", exact: true }).click();

    const fieldIcon = drawer.locator(
      '#method-btn mat-icon[data-mat-icon-name="pour-over"]',
    );
    await expect(fieldIcon).toBeVisible();
    expect(await fieldIcon.evaluate((el) => getComputedStyle(el).color)).toBe(
      "rgb(180, 83, 42)",
    );

    await drawer.getByRole("combobox").click();
    const panel = page.locator(".mat-mdc-select-panel");
    await expect(panel).toBeVisible();

    const pourOver = page.getByRole("option", {
      name: "Pour Over",
      exact: true,
    });
    expect(
      await pourOver.evaluate((el) => getComputedStyle(el).fontWeight),
    ).toBe("600");
    const dot = await pourOver.evaluate((el) => {
      const style = getComputedStyle(el, "::after");
      return { background: style.backgroundColor, width: style.width };
    });
    expect(dot).toEqual({ background: "rgb(180, 83, 42)", width: "6px" });

    const aeroPress = page.getByRole("option", {
      name: "AeroPress",
      exact: true,
    });
    expect(
      await aeroPress.evaluate((el) => getComputedStyle(el).fontWeight),
    ).toBe("400");
    const aeroIcon = aeroPress.locator("mat-icon");
    expect(await aeroIcon.evaluate((el) => getComputedStyle(el).color)).toBe(
      "rgb(180, 83, 42)",
    );

    expect(await panel.locator(".mat-pseudo-checkbox").count()).toBe(0);
  });

  test("draws the roast as three equal segments and marks Light with no checkmark", async ({
    page,
  }, testInfo) => {
    await page.goto("/journal");
    await expect(
      page.getByRole("heading", { name: "Your brews" }),
    ).toBeVisible();
    const { header, fab } = addBrewTriggers(page);
    await (isPhone(testInfo.project.name) ? fab : header).click();

    const drawer = page.locator("mat-sidenav");
    await expect(drawer).toHaveClass(/mat-drawer-opened/);
    await expect(drawer).not.toHaveClass(/mat-drawer-animating/);

    const group = drawer.getByRole("radiogroup", { name: "Roast level" });
    const light = drawer.locator("mat-button-toggle", { hasText: "Light" });
    const toggles = [
      light,
      drawer.locator("mat-button-toggle", { hasText: "Medium" }),
      drawer.locator("mat-button-toggle", { hasText: "Dark" }),
    ];
    const groupBox = (await group.boundingBox())!;
    const boxes = [];
    for (const toggle of toggles) {
      boxes.push((await toggle.boundingBox())!);
    }

    for (const box of boxes) {
      expect(Math.abs(box.width - boxes[0].width)).toBeLessThanOrEqual(0.5);
    }
    const leftGap = boxes[0].x - groupBox.x;
    const rightGap =
      groupBox.x + groupBox.width - (boxes[2].x + boxes[2].width);
    expect(leftGap).toBeGreaterThanOrEqual(2.5);
    expect(leftGap).toBeLessThanOrEqual(3.5);
    expect(rightGap).toBeGreaterThanOrEqual(2.5);
    expect(rightGap).toBeLessThanOrEqual(3.5);
    expect(groupBox.height).toBe(44);

    await light.click();
    await expect(light).toHaveCSS("background-color", "rgb(43, 29, 22)");
    await expect(light).toHaveCSS("color", "rgb(250, 246, 238)");
    await expect(group.locator(".mat-pseudo-checkbox")).toHaveCount(0);
  });
});
