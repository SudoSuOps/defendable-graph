import { NextResponse } from "next/server";
import { fetchDatasetPackage } from "@/lib/cloud";

export const runtime = "edge";

// Public proxy for a single dataset card. Uses the graph's server-side API
// key so the share URL works for any visitor without member auth.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const pkg = await fetchDatasetPackage(slug);
  if (!pkg) {
    return NextResponse.json({ error: "package not found" }, { status: 404 });
  }
  return NextResponse.json(pkg);
}
