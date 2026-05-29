import { NextResponse } from "next/server";
import { fetchDatasetCatalog, hasCloudAuth } from "@/lib/cloud";

export const runtime = "edge";

// Server-side proxy for /datasets/catalog · uses the graph's API key so the
// public listing on /datasets doesn't require browser-side auth.
export async function GET() {
  if (!hasCloudAuth()) {
    return NextResponse.json(
      { error: "DEFENDABLE_CLOUD_API_KEY not configured" },
      { status: 503 },
    );
  }
  const catalog = await fetchDatasetCatalog();
  if (!catalog) {
    return NextResponse.json(
      { error: "catalog fetch failed" },
      { status: 502 },
    );
  }
  return NextResponse.json(catalog);
}
