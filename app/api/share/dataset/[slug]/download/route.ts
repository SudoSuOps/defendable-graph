import { NextResponse } from "next/server";
import { createDatasetDownloadGrant } from "@/lib/cloud";

export const runtime = "edge";

// Initiate a dataset download from the public share view. Server-side mints
// a download receipt via the cloud's /datasets/catalog/{slug}/download
// endpoint (member-only) and returns the resulting download_url that the
// browser follows. The download_url itself is a public-share indirection
// (302 → fresh Tigris signed URL), so the caller can be unauthenticated.
//
// Two side effects worth noting:
//   - A receipt mints on the org chain every time someone clicks Download.
//     That's books-and-records by design · every access leaves a trail.
//   - If the underlying object isn't yet staged in Tigris, the response
//     surfaces `ready=false` and the caller's first GET to download_url
//     returns 425 with Retry-After.
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const grant = await createDatasetDownloadGrant(slug, 24);
  if (!grant) {
    return NextResponse.json({ error: "could not create grant" }, { status: 502 });
  }
  return NextResponse.json({
    slug,
    name: grant.package.name,
    share_url: grant.share_url,
    download_url: grant.download_url,
    ready: grant.ready,
    expires_at: grant.expires_at,
    receipt_id: grant.receipt_id,
    receipt_sha256: grant.receipt_sha256,
  });
}
