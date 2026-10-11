import { NextResponse } from "next/server";

// Check the private service binding without exposing configuration or credentials.
export async function GET() {
  const headers = { "Cache-Control": "no-store" };
  try {
    const backend = process.env.BACKEND_API_URL ?? "http://127.0.0.1:8000";
    const response = await fetch(new URL("/health", backend), {
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
    const result = await response.json();
    if (!response.ok || result?.data?.status !== "ok") throw new Error();
    return NextResponse.json({ status: "ok" }, { headers });
  } catch {
    return NextResponse.json({ status: "unavailable" }, { status: 503, headers });
  }
}
