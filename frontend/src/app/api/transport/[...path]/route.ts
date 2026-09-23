import { timingSafeEqual } from "node:crypto";

import { NextRequest, NextResponse } from "next/server";

import { isSameOrigin } from "@/lib/server/same-origin";

type Context = { params: Promise<{ path: string[] }> };

const uuid = "[0-9a-fA-F-]{36}";
const slug = "[a-z0-9]+(?:-[a-z0-9]+)*";
const allowed: Record<string, RegExp[]> = {
  GET: [
    /^transport\/snapshot$/,
    /^transport\/dates$/,
    /^transport\/schedules$/,
    /^transport\/drivers$/,
    /^admin\/transport$/,
  ],
  POST: [/^admin\/transport\/(routes|buses|drivers|schedules)$/],
  PUT: [
    new RegExp(`^admin/transport/routes/${slug}$`),
    new RegExp(`^admin/transport/buses/${slug}$`),
    new RegExp(`^admin/transport/(drivers|schedules)/${uuid}$`),
  ],
  DELETE: [
    new RegExp(`^admin/transport/routes/${slug}$`),
    new RegExp(`^admin/transport/buses/${slug}$`),
    new RegExp(`^admin/transport/(drivers|schedules)/${uuid}$`),
  ],
};

async function proxy(request: NextRequest, context: Context) {
  const token = request.cookies.get("unicircle_session")?.value;
  if (!token) {
    return NextResponse.json(
      { error: { message: "Please sign in." } },
      { status: 401 },
    );
  }
  const path = (await context.params).path.join("/");
  if (!allowed[request.method]?.some((pattern) => pattern.test(path))) {
    return NextResponse.json({ error: { message: "Not found." } }, { status: 404 });
  }
  const mutation = request.method !== "GET";
  if (mutation) {
    if (!isSameOrigin(request)) {
      return NextResponse.json(
        { error: { message: "Request origin is not allowed." } },
        { status: 403 },
      );
    }
    const expected = request.cookies.get("unicircle_csrf")?.value;
    const supplied = request.headers.get("x-csrf-token");
    if (!expected || !supplied) {
      return NextResponse.json(
        { error: { message: "Session expired." } },
        { status: 401 },
      );
    }
    const left = Buffer.from(expected);
    const right = Buffer.from(supplied);
    if (left.length !== right.length || !timingSafeEqual(left, right)) {
      return NextResponse.json(
        { error: { message: "Security check failed." } },
        { status: 403 },
      );
    }
    if (
      request.method !== "DELETE" &&
      !request.headers.get("content-type")?.startsWith("application/json")
    ) {
      return NextResponse.json(
        { error: { message: "JSON is required." } },
        { status: 415 },
      );
    }
  }
  const body =
    mutation && request.method !== "DELETE" ? await request.text() : undefined;
  if (body && body.length > 16_384) {
    return NextResponse.json(
      { error: { message: "Request is too large." } },
      { status: 413 },
    );
  }
  try {
    const target = new URL(
      `/api/v1/${path}`,
      process.env.BACKEND_API_URL ?? "http://127.0.0.1:8000",
    );
    if (!mutation) target.search = request.nextUrl.search;
    const response = await fetch(target, {
      method: request.method,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      body,
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
    if (response.status === 204) return new NextResponse(null, { status: 204 });
    const result = await response.json().catch(() => null);
    if (!result) {
      return NextResponse.json(
        { error: { message: "Invalid backend response." } },
        { status: 502 },
      );
    }
    return NextResponse.json(result, { status: response.status });
  } catch {
    return NextResponse.json(
      { error: { message: "Transport service is temporarily unavailable." } },
      { status: 503 },
    );
  }
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const DELETE = proxy;
