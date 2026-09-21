import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const token = request.cookies.get("unicircle_session")?.value;
  if (!token) {
    return NextResponse.json(
      { error: { message: "Please sign in to view the campus map." } },
      { status: 401 },
    );
  }

  try {
    const backendBase = process.env.BACKEND_API_URL ?? "http://127.0.0.1:8000";
    const headers = { Authorization: `Bearer ${token}` };
    const [mapResponse, locationsResponse] = await Promise.all(
      ["/api/v1/campus/map", "/api/v1/campus/locations"].map((path) =>
        fetch(new URL(path, backendBase), {
          headers,
          cache: "no-store",
          signal: AbortSignal.timeout(10_000),
        }),
      ),
    );
    if (!mapResponse.ok || !locationsResponse.ok) {
      const status =
        mapResponse.status === 401 || locationsResponse.status === 401 ? 401 : 502;
      return NextResponse.json(
        { error: { message: "The CUET campus map is temporarily unavailable." } },
        { status },
      );
    }
    const [mapResult, locationsResult] = await Promise.all([
      mapResponse.json(),
      locationsResponse.json(),
    ]);
    if (!mapResult?.data || !Array.isArray(locationsResult?.data)) {
      return NextResponse.json(
        { error: { message: "Invalid campus map service response." } },
        { status: 502 },
      );
    }
    return NextResponse.json(
      { data: { map: mapResult.data, locations: locationsResult.data } },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json(
      { error: { message: "The CUET campus map is temporarily unavailable." } },
      { status: 503 },
    );
  }
}
