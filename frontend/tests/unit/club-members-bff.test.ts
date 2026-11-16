// @vitest-environment node
import { NextRequest } from "next/server";
import { beforeEach, expect, test, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { GET, POST } from "@/app/api/club-events/[...path]/route";

const fetchMock = vi.fn<typeof fetch>();
const path = [
  "clubs",
  "cuet-computer-club",
  "members",
  "11111111-1111-4111-8111-111111111111",
  "remove",
];

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

function removal(origin = "http://localhost:3000", csrf = "test-csrf") {
  return new NextRequest("http://localhost:3000/api/club-events/" + path.join("/"), {
    method: "POST",
    headers: {
      Origin: origin,
      Host: "localhost:3000",
      "Content-Type": "application/json",
      "X-CSRF-Token": csrf,
      Cookie: "unicircle_session=test-session; unicircle_csrf=test-csrf",
    },
    body: JSON.stringify({ feedback: "Please complete club attendance requirements." }),
  });
}

test("member removal forwards feedback through the authenticated same-origin API", async () => {
  fetchMock.mockResolvedValueOnce(
    Response.json({ data: { club: { id: "cuet-computer-club" } } }),
  );
  const response = await POST(removal(), { params: Promise.resolve({ path }) });
  expect(response.status).toBe(200);
  const [url, options] = fetchMock.mock.calls[0];
  expect(String(url)).toContain("/api/v1/" + path.join("/"));
  expect(options?.headers).toEqual(
    expect.objectContaining({ Authorization: "Bearer test-session" }),
  );
  expect(JSON.parse(options?.body as string)).toEqual({
    feedback: "Please complete club attendance requirements.",
  });
});

test("member removal rejects a foreign origin and mismatched CSRF token", async () => {
  expect(
    (
      await POST(removal("https://foreign.example"), {
        params: Promise.resolve({ path }),
      })
    ).status,
  ).toBe(403);
  expect(
    (
      await POST(removal("http://localhost:3000", "wrong-token"), {
        params: Promise.resolve({ path }),
      })
    ).status,
  ).toBe(403);
  expect(fetchMock).not.toHaveBeenCalled();
});

test("member listing requires a session cookie", async () => {
  const request = new NextRequest(
    "http://localhost:3000/api/club-events/clubs/cuet-computer-club/members",
  );
  const response = await GET(request, {
    params: Promise.resolve({ path: ["clubs", "cuet-computer-club", "members"] }),
  });
  expect(response.status).toBe(401);
  expect(fetchMock).not.toHaveBeenCalled();
});
