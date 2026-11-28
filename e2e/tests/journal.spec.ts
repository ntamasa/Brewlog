import { test, expect, type Page } from "@playwright/test";
import { uniqueName } from "./support";

test.describe("journal search", () => {
  test("searches brews by name from the toolbar and shows the matches and the chip", async ({
    page,
  }, testInfo) => {
    const p = uniqueName(`S ${testInfo.project.name}`);
    const methods: { id: number; name: string }[] = await (
      await page.request.get("/api/methods")
    ).json();
    const otherId = methods.find((method) => method.name === "Other")?.id;
    expect(otherId).toBeDefined();

    const brews = [
      {
        name: `${p} Kenyan Morning`,
        beanName: "AA Kiambu",
        origin: "Kenya",
        methodId: otherId,
        roast: "LIGHT",
        rating: 5,
        brewDate: "2026-11-01",
        notes: null,
      },
      {
        name: `${p} KENYA AA Batch`,
        beanName: "AA Batch",
        origin: "Kenya",
        methodId: otherId,
        roast: "MEDIUM",
        rating: 4,
        brewDate: "2026-10-30",
        notes: "Blackcurrant and lime",
      },
      {
        name: `${p} Sunday Moka`,
        beanName: "Santos",
        origin: "Brazil",
        methodId: otherId,
        roast: "DARK",
        rating: 3,
        brewDate: "2026-10-25",
        notes: null,
      },
    ];
    for (const data of brews) {
      const response = await page.request.post("/api/brews", { data });
      expect(response.status()).toBe(201);
    }

    await page.goto("/journal");
    await page.getByPlaceholder("Search brew names").fill(`  ${p} kenya `);

    const cards = page.locator("app-brew-card");
    await expect(cards).toHaveCount(2);
    await expect(cards.filter({ hasText: `${p} Kenyan Morning` })).toHaveCount(
      1,
    );
    await expect(cards.filter({ hasText: `${p} KENYA AA Batch` })).toHaveCount(
      1,
    );
    await expect(page.locator(".chip")).toContainText(`“${p} kenya”`);
    await expect(page).toHaveURL(/q=/);
  });
});

test.describe("journal toolbar layout", () => {
  async function openJournalWithBrew(page: Page, projectName: string) {
    const p = uniqueName(`T ${projectName}`);
    const methods: { id: number; name: string }[] = await (
      await page.request.get("/api/methods")
    ).json();
    const otherId = methods.find((method) => method.name === "Other")?.id;
    expect(otherId).toBeDefined();

    const response = await page.request.post("/api/brews", {
      data: {
        name: `${p} Toolbar brew`,
        beanName: "Santos",
        origin: "Brazil",
        methodId: otherId,
        roast: "MEDIUM",
        rating: 3,
        brewDate: "2026-10-25",
        notes: null,
      },
    });
    expect(response.status()).toBe(201);

    await page.goto("/journal");
    await expect(page.getByPlaceholder("Search brew names")).toBeVisible();
  }

  test("spans the phone toolbar and hides its caption visually", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== "phone");
    await openJournalWithBrew(page, testInfo.project.name);

    const toolbar = page.locator("app-journal-toolbar .toolbar");
    const field = toolbar.locator("mat-form-field", {
      has: page.locator("#q"),
    });
    const caption = toolbar.locator('label.field-label[for="q"]');
    const search = page.getByPlaceholder("Search brew names");

    await expect
      .poll(async () => {
        const fieldBox = await field.boundingBox();
        const toolbarBox = await toolbar.boundingBox();
        return Math.round(fieldBox!.width) - Math.round(toolbarBox!.width);
      })
      .toBe(0);
    await expect
      .poll(async () => {
        const fieldBox = await field.boundingBox();
        const toolbarBox = await toolbar.boundingBox();
        return Math.round(fieldBox!.x) - Math.round(toolbarBox!.x);
      })
      .toBe(0);

    await expect(caption).toHaveCSS("position", "absolute");
    await expect(caption).toHaveCSS("width", "1px");
    await expect(caption).toHaveCSS("height", "1px");
    await expect(caption).toHaveCSS("overflow", "hidden");
    await expect(page.locator("#q")).toHaveAccessibleName("Search");

    await search.fill("panama natural");
    await expect
      .poll(() =>
        search.evaluate(
          (el: HTMLInputElement) => el.scrollWidth <= el.clientWidth,
        ),
      )
      .toBe(true);
  });

  test("keeps the desktop toolbar with its visible caption", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop");
    await openJournalWithBrew(page, testInfo.project.name);

    const toolbar = page.locator("app-journal-toolbar .toolbar");
    const field = toolbar.locator("mat-form-field", {
      has: page.locator("#q"),
    });
    const caption = toolbar.locator('label.field-label[for="q"]');

    await expect(caption).toHaveCSS("position", "static");
    await expect(caption).toHaveText("Search");
    await expect
      .poll(async () => {
        const fieldBox = await field.boundingBox();
        const toolbarBox = await toolbar.boundingBox();
        return fieldBox!.width < toolbarBox!.width / 2;
      })
      .toBe(true);
  });

  test("shows the Sort select on desktop with its name and Newest first", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop");
    await openJournalWithBrew(page, testInfo.project.name);

    const sort = page.locator("#f-sort");
    await expect(sort).toBeVisible();
    await expect(sort).toHaveAccessibleName("Sort");
    await expect(sort).toContainText("Newest first");
  });

  test("hides the Sort select on phone, and keeps the search", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== "phone");
    await openJournalWithBrew(page, testInfo.project.name);

    await expect(page.locator("#f-sort")).toBeHidden();
    await expect(page.locator("#f-sort-label")).toBeHidden();
    await expect(page.locator("#q")).toBeVisible();
  });

  test("shows the Sort select from 768 px wide, and hides it below", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop");
    await openJournalWithBrew(page, testInfo.project.name);

    await page.setViewportSize({ width: 767, height: 900 });
    await expect(page.locator("#f-sort")).toBeHidden();

    await page.setViewportSize({ width: 768, height: 900 });
    await expect(page.locator("#f-sort")).toBeVisible();
  });
});

test.describe("journal sort", () => {
  function isoDay(daysAgo: number): string {
    const day = new Date();
    day.setDate(day.getDate() - daysAgo);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${day.getFullYear()}-${pad(day.getMonth() + 1)}-${pad(day.getDate())}`;
  }

  test("sorts the cards by the URL sort, newest first by default", async ({
    page,
  }, testInfo) => {
    const p = uniqueName(`Sort ${testInfo.project.name}`);
    const methods: { id: number; name: string }[] = await (
      await page.request.get("/api/methods")
    ).json();
    const otherId = methods.find((method) => method.name === "Other")?.id;
    expect(otherId).toBeDefined();

    const brews = [
      { name: `${p} A`, rating: 4, brewDate: isoDay(0) },
      { name: `${p} B`, rating: 4, brewDate: isoDay(0) },
      { name: `${p} C`, rating: 5, brewDate: isoDay(1) },
    ];
    for (const brew of brews) {
      const response = await page.request.post("/api/brews", {
        data: {
          name: brew.name,
          beanName: "AA Kiambu",
          origin: "Kenya",
          methodId: otherId,
          roast: "MEDIUM",
          rating: brew.rating,
          brewDate: brew.brewDate,
          notes: null,
        },
      });
      expect(response.status()).toBe(201);
    }

    const cards = page.locator("app-brew-card h3");
    const search = (sort?: string) => {
      const params = new URLSearchParams({ q: p });
      if (sort) params.set("sort", sort);
      return `/journal?${params.toString()}`;
    };

    await page.goto(search());
    await expect(cards).toHaveText([`${p} B`, `${p} A`, `${p} C`]);

    await page.goto(search("OLDEST"));
    await expect(cards).toHaveText([`${p} C`, `${p} A`, `${p} B`]);

    await page.goto(search("HIGHEST"));
    await expect(cards).toHaveText([`${p} C`, `${p} B`, `${p} A`]);

    await page.goto(search("LOWEST"));
    await expect(cards).toHaveText([`${p} B`, `${p} A`, `${p} C`]);
  });
});
