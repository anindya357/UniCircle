import { expect, test } from "@playwright/test";

test("visitors browse departments, faculty profiles and campus map from home", async ({
  page,
}, testInfo) => {
  test.setTimeout(120_000);
  await page.goto("/");
  const navigation = page.getByRole("navigation", { name: "Public navigation" });
  await navigation.getByRole("link", { name: "Directory", exact: true }).click();
  await expect(page).toHaveURL(/\/directory$/);
  await expect(
    page.getByRole("heading", { name: /Find the people shaping/ }),
  ).toBeVisible();
  await expect(page.getByRole("tab", { name: /CSE/ })).toBeVisible();
  await page.getByRole("tab", { name: /EEE/ }).click();
  await expect(page.getByRole("heading", { name: /Electrical/i })).toBeVisible();
  const profile = page.locator('a[href^="/directory/faculty/"]').first();
  await expect(profile).toBeVisible();
  await profile.click();
  await expect(page).toHaveURL(/\/directory\/faculty\/[a-z]+-[0-9]+$/, {
    timeout: 45_000,
  });
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible({
    timeout: 30_000,
  });
  await expect(page.getByText("Page not found", { exact: true })).toHaveCount(0);
  await page
    .getByRole("navigation", { name: "Public navigation" })
    .getByRole("link", { name: "Campus Explorer" })
    .click();
  await expect(page).toHaveURL(/\/campus-explorer$/);
  await expect(
    page.getByRole("heading", { name: "Find your way around CUET." }),
  ).toBeVisible();
  await expect(page.locator(".leaflet-container")).toBeVisible({ timeout: 30_000 });
  expect((await page.request.get("/api/directory")).status()).toBe(200);
  const map = await page.request.get("/api/campus-explorer");
  expect(map.status()).toBe(200);
  expect((await map.json()).data.locations.length).toBeGreaterThan(0);
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
  ).toBe(true);
  await page.screenshot({
    path: testInfo.outputPath("public-campus-map.png"),
    fullPage: true,
  });
  await page.goto("/assistant");
  await expect(page).toHaveURL(/\/login$/);
});
