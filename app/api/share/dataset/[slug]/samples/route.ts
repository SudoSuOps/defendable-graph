import { NextResponse } from "next/server";
import { hasCloudAuth } from "@/lib/cloud";

export const runtime = "edge";

// Server-side proxy for /datasets/catalog/{slug}/samples · uses the graph's
// API key so the public share view can show sample rows without member auth.
//
// Forwards limit (1..50) and surfaces 425 + Retry-After when the dataset
// isn't yet staged in Tigris.
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  if (!hasCloudAuth()) {
    return NextResponse.json(
      { error: "DEFENDABLE_CLOUD_API_KEY not configured" },
      { status: 503 },
    );
  }
  const { slug } = await params;
  const { searchParams } = new URL(request.url);
  const limit = Math.max(1, Math.min(50, Number(searchParams.get("limit") || 5)));

  const base = (
    process.env.DEFENDABLE_CLOUD_API_BASE || "https://api.defendablecloud.com"
  ).replace(/\/$/, "");
  const r = await fetch(
    `${base}/datasets/catalog/${encodeURIComponent(slug)}/samples?limit=${limit}`,
    {
      headers: { Authorization: `Bearer ${process.env.DEFENDABLE_CLOUD_API_KEY}` },
      next: { revalidate: 60 },
    },
  );
  // Pass through · 425 in particular surfaces the staging-not-ready state.
  const body = await r.text();
  return new NextResponse(body, {
    status: r.status,
    headers: { "Content-Type": "application/json" },
  });
}
