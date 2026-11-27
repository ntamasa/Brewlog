import { test, expect } from "@playwright/test";
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
