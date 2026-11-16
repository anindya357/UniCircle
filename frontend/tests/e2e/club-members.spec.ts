import { expect as baseExpect, test, type Page } from "@playwright/test";

const expect = baseExpect.configure({ timeout: 30_000 });
const clubId = "cuet-computer-club";

async function login(page: Page, username: string, password: string) {
  await page.goto("/login");
  await page.getByLabel("Username or CUET email").fill(username);
  await page.getByLabel(/^Password/).fill(password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL("/");
}

async function writeHeaders(page: Page, baseURL: string) {
  const csrf = (await page.context().cookies()).find(
    (cookie) => cookie.name === "unicircle_csrf",
  );
  expect(csrf).toBeDefined();
  return {
    Origin: baseURL,
    "X-CSRF-Token": csrf!.value,
    "Content-Type": "application/json",
  };
}

test("club admin removes a member with private feedback and the member can reapply", async ({
  page,
  browser,
  request,
  baseURL,
}, testInfo) => {
  test.setTimeout(180_000);
  expect(new URL(baseURL ?? "").hostname).toBe("127.0.0.1");
  const suffix = testInfo.project.name;
  const username = `members.${suffix}`;
  const email = `${username}@student.cuet.ac.bd`;
  const password = "MemberTestPass123!";
  const name = `Membership ${suffix}`;
  // All setup is against the disposable e2e_server fixture with captured SMTP.
  const registered = await request.post("http://127.0.0.1:8012/api/v1/auth/register", {
    data: {
      firstName: "Membership",
      lastName: suffix,
      homeAddress: "CUET",
      username,
      email,
      password,
      role: "student",
      universityId: `member-${suffix}`,
    },
  });
  expect(registered.status()).toBe(201);
  expect(
    (
      await request.post("http://127.0.0.1:8012/api/v1/auth/verify-otp", {
        data: { email, otp: "123456" },
      })
    ).status(),
  ).toBe(204);

  await login(page, "e2e.student", "StudentPass123!");
  const adminHeaders = await writeHeaders(page, baseURL!);
  expect(
    (
      await page.request.put(`/api/club-events/clubs/${clubId}/membership-settings`, {
        headers: adminHeaders,
        data: {
          recruitment_open: true,
          bkash_number: "01712345678",
          nagad_number: "01812345678",
        },
      })
    ).status(),
  ).toBe(200);

  const memberPage = await browser.newPage({ baseURL, viewport: page.viewportSize() });
  try {
    await login(memberPage, username, password);
    const memberHeaders = await writeHeaders(memberPage, baseURL!);
    const application = {
      applicant_name: name,
      email,
      student_id: `member-${suffix}`,
      department_name: "CSE",
      phone: "01912345678",
      motivation: "I want to volunteer and learn with this club.",
      payment_method: "bkash",
      transaction_id: `TRX-${suffix}`,
    };
    const applied = await memberPage.request.post(
      `/api/club-events/clubs/${clubId}/membership-requests`,
      {
        headers: memberHeaders,
        data: application,
      },
    );
    expect(applied.status()).toBe(201);
    const applicationId = (await applied.json()).data.id;
    expect(
      (
        await page.request.post(
          `/api/club-events/clubs/${clubId}/membership-requests/${applicationId}/approve`,
          {
            headers: adminHeaders,
            data: {},
          },
        )
      ).status(),
    ).toBe(200);

    await page.goto(`/clubs/${clubId}`);
    await page.getByRole("link", { name: "See club members", exact: true }).click();
    await expect(page).toHaveURL(`/clubs/${clubId}/members`);
    await expect(page.getByRole("heading", { name, exact: true })).toBeVisible();
    await expect(
      page
        .getByRole("article")
        .filter({ has: page.getByRole("heading", { name, exact: true }) }),
    ).toContainText("CSE");
    await page.getByLabel("Search members").fill(`member-${suffix}`);
    await page.getByRole("button", { name: `Remove ${name}`, exact: true }).click();
    await expect(
      page.getByRole("button", { name: "Confirm removal and notify" }),
    ).toBeDisabled();
    const feedback = `Attendance requirement not met for ${suffix}. Please apply after completing it.`;
    await page.getByLabel(`Feedback for ${name}`).fill(feedback);
    const fits = await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    );
    expect(fits).toBe(true);
    await page.screenshot({
      path: testInfo.outputPath("member-removal-form.png"),
      fullPage: true,
    });
    await page.getByRole("button", { name: "Confirm removal and notify" }).click();
    await expect(
      page.getByRole("status").filter({ hasText: `${name} was removed` }),
    ).toBeVisible();
    await expect(page.getByRole("heading", { name, exact: true })).toHaveCount(0);
    await page.reload();
    await expect(
      page.getByRole("heading", { name: "Club members", exact: true }),
    ).toBeVisible();
    await expect(page.getByRole("heading", { name, exact: true })).toHaveCount(0);

    await memberPage.goto("/notifications");
    await expect(memberPage.getByText(feedback, { exact: true })).toBeVisible();
    await expect(
      memberPage.getByText("Membership removed", { exact: true }),
    ).toBeVisible();
    await memberPage.screenshot({
      path: testInfo.outputPath("membership-feedback-notification.png"),
      fullPage: true,
    });
    await memberPage.goto(`/clubs/${clubId}/members`);
    await expect(
      memberPage.getByRole("heading", { name: "Club Admin access required" }),
    ).toBeVisible();
    await memberPage.goto(`/clubs/${clubId}`);
    await expect(
      memberPage.getByRole("button", { name: "Be a member", exact: true }),
    ).toBeVisible();
    const reapplied = await memberPage.request.post(
      `/api/club-events/clubs/${clubId}/membership-requests`,
      {
        headers: memberHeaders,
        data: { ...application, transaction_id: `NEW-${suffix}` },
      },
    );
    expect(reapplied.status()).toBe(201);
    await page.goto("/notifications");
    await expect(page.getByText(feedback, { exact: true })).toHaveCount(0);
  } finally {
    await memberPage.close();
  }
});
