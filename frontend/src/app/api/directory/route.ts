import { NextResponse } from "next/server";

export async function GET() {
  try {
    const backendBase = process.env.BACKEND_API_URL ?? "http://127.0.0.1:8000";
    const upstream = await fetch(new URL("/api/v1/departments", backendBase), {
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
    const result = await upstream.json().catch(() => null);
    if (!result) {
      return NextResponse.json(
        { error: { message: "Invalid directory service response." } },
        { status: 502 },
      );
    }
    return NextResponse.json(result, {
      status: upstream.status,
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return NextResponse.json(
      { error: { message: "The directory service is temporarily unavailable." } },
      { status: 503 },
    );
  }
}
