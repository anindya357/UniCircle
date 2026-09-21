import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const token = request.cookies.get("unicircle_session")?.value;
  if (!token) {
    return NextResponse.json(
      { error: { message: "Please sign in to view the directory." } },
      { status: 401 },
    );
  }

  try {
    const backendBase = process.env.BACKEND_API_URL ?? "http://127.0.0.1:8000";
    const upstream = await fetch(new URL("/api/v1/departments", backendBase), {
      headers: { Authorization: `Bearer ${token}` },
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
