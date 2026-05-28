// Thin DefendableCloud API client for the graph's server-side route handlers.
//
// Reads:
//   DEFENDABLE_CLOUD_API_BASE   default https://api.defendablecloud.com
//   DEFENDABLE_CLOUD_API_KEY    required for /receipts/recent (member-only)
//                               unset → server falls back to seed data
//
// /share/{token} is public (no auth), so the Inspector panel works regardless.

export interface ReceiptRollup {
  receipt_id: string;
  org_seq: number;
  payload_schema: string;
  receipt_sha256: string;
  share_url: string;
  created_at: string | null;
  summary: Record<string, unknown>;
}

export interface ReceiptRollupList {
  rollups: ReceiptRollup[];
  count: number;
}

export interface PublicReceipt {
  receipt_id: string;
  org_seq: number;
  parent_hash: string;
  receipt_sha256: string;
  verified: boolean;
  created_at: string;
  payload: Record<string, unknown>;
}

function cloudBase(): string {
  return (process.env.DEFENDABLE_CLOUD_API_BASE || "https://api.defendablecloud.com").replace(/\/$/, "");
}

function cloudKey(): string | null {
  return process.env.DEFENDABLE_CLOUD_API_KEY || null;
}

/** Whether the env exposes a member-grade auth key for the live chain. */
export function hasCloudAuth(): boolean {
  return !!cloudKey();
}

/**
 * Fetch the N most recent receipts on the calling org's chain.
 * Returns null when no API key is configured (caller falls back to seed).
 */
export async function fetchRecentReceipts(limit = 50): Promise<ReceiptRollupList | null> {
  const key = cloudKey();
  if (!key) return null;
  const res = await fetch(`${cloudBase()}/receipts/recent?limit=${limit}`, {
    headers: { Authorization: `Bearer ${key}` },
    // CF Pages edge runtime: short cache so the dashboard feels live but
    // we don't hammer the API on every page hit.
    next: { revalidate: 15 },
  });
  if (!res.ok) {
    // Bubble up structured info; caller decides whether to swallow + fall back.
    console.warn(
      `[cloud] /receipts/recent ${res.status} ${await res.text().catch(() => "")}`
        .slice(0, 240),
    );
    return null;
  }
  return (await res.json()) as ReceiptRollupList;
}

/** Fetch a single public receipt by share token (no auth required). */
export async function fetchPublicReceipt(token: string): Promise<PublicReceipt | null> {
  if (!token) return null;
  const res = await fetch(`${cloudBase()}/share/${encodeURIComponent(token)}`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) return null;
  return (await res.json()) as PublicReceipt;
}

/** Extract a share token from any URL form the cloud emits. */
export function extractShareToken(raw: string): string | null {
  if (!raw) return null;
  const m = raw.match(/\/(?:r|share)\/([A-Za-z0-9_-]+)/);
  if (m) return m[1];
  if (/^[A-Za-z0-9_-]+$/.test(raw)) return raw;
  return null;
}
