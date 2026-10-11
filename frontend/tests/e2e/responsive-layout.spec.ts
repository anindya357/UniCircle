import { expect, test } from "@playwright/test";

const protectedPages = [
  "/",
  "/directory",
  "/campus-explorer",
  "/clubs",
  "/events",
  "/resources",
  "/chat",
  "/transport",
  "/forum",
  "/news",
  "/assistant",
  "/profile",
  "/notifications",
];

async function assertReflow(page: import("@playwright/test").Page) {
  await expect(page.locator("main h1").first()).toBeVisible();
  const result = await page.evaluate(() => {
    const shell = document.querySelector(".app-shell")?.getBoundingClientRect();
    const controls = Array.from(
      document.querySelectorAll(
        "main h1, main h2, main input, main textarea, main select",
      ),
    );
    const clipped = controls.filter((element) => {
      const rect = element.getBoundingClientRect();
      return rect.height > 0 && (rect.left < -1 || rect.right > innerWidth + 1);
    });
    return {
      width: innerWidth,
      document: document.documentElement.scrollWidth,
      shell: shell?.width ?? 0,
      clipped: clipped.length,
    };
  });
  expect(result.document).toBeLessThanOrEqual(result.width + 1);
  expect(result.shell).toBeLessThanOrEqual(result.width);
  expect(result.clipped).toBe(0);
}

for (const width of [320, 390, 768, 1366]) {
  test(`public screens reflow at ${width}px without changing browser zoom`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 844 });
    for (const route of ["/", "/login", "/register"]) {
      await page.goto(route);
      await assertReflow(page);
      if (route === "/") {
        const title = page.getByRole("heading", { name: "Welcome to CUET Campus" });
        await expect(title).toBeVisible();
        const size = await title.evaluate((el) =>
          parseFloat(getComputedStyle(el).fontSize),
        );
        expect(size).toBeLessThanOrEqual(width <= 390 ? 36 : 52);
        const video = page.locator("video");
        await expect(video).toHaveCount(1);
        const rect = await video.boundingBox();
        expect(rect?.width).toBeGreaterThan(0);
        expect(rect?.height).toBeGreaterThan(0);
      } else if (width <= 390) {
        const inputs = await page
          .locator("form input:not([type='radio']):not([type='checkbox'])")
          .all();
        for (const input of inputs) {
          expect(
            await input.evaluate((el) => parseFloat(getComputedStyle(el).fontSize)),
          ).toBeGreaterThanOrEqual(16);
        }
      }
    }
  });

  test(`signed-in screens reflow at ${width}px`, async ({ page, baseURL }) => {
    test.setTimeout(180_000);
    // These credentials belong only to the disposable tests.e2e_server fixture.
    expect(new URL(baseURL ?? "").hostname).toBe("127.0.0.1");
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/login");
    await page.getByLabel("Username or CUET email").fill("e2e.student");
    await page.getByLabel(/^Password/).fill("StudentPass123!");
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await expect(page).toHaveURL("/");
    if (width <= 768) {
      const toggle = page.getByRole("button", { name: "Open navigation", exact: true });
      await toggle.click();
      await expect(
        page.getByRole("button", { name: "Close navigation", exact: true }),
      ).toHaveAttribute("aria-expanded", "true");
      const navigation = page.getByRole("navigation", { name: "Primary navigation" });
      await expect(navigation).toBeVisible();
      const bounds = await navigation.boundingBox();
      expect(bounds?.x).toBeGreaterThanOrEqual(0);
      expect((bounds?.x ?? 0) + (bounds?.width ?? 0)).toBeLessThanOrEqual(width);
      await navigation.getByRole("link", { name: "Directory", exact: true }).click();
      await expect(page).toHaveURL(/\/directory$/);
    }
    for (const route of protectedPages) {
      await page.goto(route);
      await assertReflow(page);
    }
    await page.goto("/clubs/cuet-computer-club");
    await assertReflow(page);
  });

  test(`admin workspaces reflow at ${width}px`, async ({ page, baseURL }) => {
    test.setTimeout(120_000);
    expect(new URL(baseURL ?? "").hostname).toBe("127.0.0.1");
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/admin/login");
    await page.getByLabel(/Admin ID/).fill("e2e-admin");
    await page.getByLabel(/^Password/).fill("AdminPass123!");
    await page.getByRole("button", { name: "Access Admin portal" }).click();
    await expect(page).toHaveURL(/\/admin$/);
    await assertReflow(page);
    for (const name of [/^Transport/, /^Announcements/, /^Reports/]) {
      await page.getByRole("button", { name }).first().click();
      await assertReflow(page);
    }
  });
}
