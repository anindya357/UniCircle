import { timingSafeEqual } from "node:crypto";

import { NextRequest, NextResponse } from "next/server";

import { isSameOrigin } from "@/lib/server/same-origin";

export async function PATCH(request: NextRequest) {
  if (!isSameOrigin(request)) {
    return NextResponse.json(
      { error: { message: "Request origin is not allowed." } },
      { status: 403 },
    );
  }
  const token = request.cookies.get("unicircle_session")?.value;
  const csrf = request.cookies.get("unicircle_csrf")?.value;
  const supplied = request.headers.get("x-csrf-token");
  if (!token || !csrf || !supplied) {
    return NextResponse.json(
      { error: { message: "Session expired." } },
      { status: 401 },
    );
  }
  const a = Buffer.from(csrf);
  const b = Buffer.from(supplied);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return NextResponse.json(
      { error: { message: "Security check failed." } },
      { status: 403 },
    );
  }
  if (!request.headers.get("content-type")?.startsWith("application/json")) {
    return NextResponse.json(
      { error: { message: "JSON is required." } },
      { status: 415 },
    );
  }
  const body = await request.text();
  if (body.length > 8_192) {
    return NextResponse.json(
      { error: { message: "Request is too large." } },
      { status: 413 },
    );
  }
  try {
    const backendBase = process.env.BACKEND_API_URL ?? "http://127.0.0.1:8000";
    const upstream = await fetch(new URL("/api/v1/users/me", backendBase), {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body,
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
    const result = await upstream.json().catch(() => null);
    if (!result) {
      return NextResponse.json(
        { error: { message: "Invalid backend response." } },
        { status: 502 },
      );
    }
    return NextResponse.json(result, {
      status: upstream.status,
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return NextResponse.json(
      { error: { message: "The profile service is temporarily unavailable." } },
      { status: 503 },
    );
  }
}
