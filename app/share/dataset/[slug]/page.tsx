"use client";

export const runtime = "edge";

import Link from "next/link";
import { useEffect, useState } from "react";
import { use } from "react";
import {
  ArrowRight,
  Check,
  Copy,
  Database,
  Download,
  GitBranch,
  ShieldCheck,
} from "lucide-react";
import { Shell } from "@/components/chrome";

interface DatasetPackage {
  slug: string;
  name: string;
  vertical: string;
  tier: string;
  pkg_class: string;
  pairs: number;
  deed_anchored: boolean;
  deed: string;
}

interface DownloadGrant {
  slug: string;
  name: string;
  share_url: string;
  download_url: string;
  ready: boolean;
  expires_at: string;
  receipt_id: string;
  receipt_sha256: string;
}

interface SamplesResponse {
  package: DatasetPackage;
  tigris_key: string;
  file_bytes: number;
  file_etag: string;
  rows: Record<string, unknown>[];
  count: number;
  basename: string;
}

function inferSchema(rows: Record<string, unknown>[]): string[] {
  if (!rows || rows.length === 0) return [];
  const keys = new Set<string>();
  for (const r of rows.slice(0, 10)) Object.keys(r).forEach((k) => keys.add(k));
  return Array.from(keys).sort();
}

function formatBytes(n: number): string {
  if (!n) return "0 B";
  const u = ["B", "KB", "MB", "GB", "TB"];
  let i = 0;
  let v = n;
  while (v >= 1024 && i < u.length - 1) {
    v /= 1024;
    i++;
  }
  return `${v.toFixed(v < 10 ? 2 : v < 100 ? 1 : 0)} ${u[i]}`;
}

const VERTICAL_LABEL: Record<string, string> = {
  cre: "CRE",
  medical: "Medical",
  grants: "Grants",
  jelly: "Jelly",
  signal: "Signal",
  "capital-markets": "Capital Markets",
  "bee-hive": "Bee-Hive",
  legal: "Legal",
  finance: "Finance",
  aviation: "Aviation",
  openalex: "OpenAlex",
  failure: "Failure",
};

export default function DatasetSharePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [pkg, setPkg] = useState<DatasetPackage | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const [grant, setGrant] = useState<DownloadGrant | null>(null);
  const [granting, setGranting] = useState<string | null>(null);
  const [copiedShare, setCopiedShare] = useState(false);
  const [grantErr, setGrantErr] = useState<string | null>(null);

  const [samples, setSamples] = useState<SamplesResponse | null>(null);
  const [samplesStatus, setSamplesStatus] = useState<
    "loading" | "ready" | "preparing" | "error"
  >("loading");

  useEffect(() => {
    fetch(`/api/share/dataset/${encodeURIComponent(slug)}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(`HTTP ${r.status}`)))
      .then(setPkg)
      .catch((e) => setErr(String(e)));
  }, [slug]);

  // Pull a tiny sample preview directly from the Tigris-staged object via
  // server-side proxy. 425 means not-yet-staged; we surface a "preparing"
  // hint and the member can trigger staging via the Download button below.
  useEffect(() => {
    fetch(`/api/share/dataset/${encodeURIComponent(slug)}/samples?limit=5`)
      .then(async (r) => {
        if (r.status === 425) {
          setSamplesStatus("preparing");
          return null;
        }
        if (!r.ok) {
          setSamplesStatus("error");
          return null;
        }
        const body: SamplesResponse = await r.json();
        setSamples(body);
        setSamplesStatus("ready");
        return body;
      })
      .catch(() => setSamplesStatus("error"));
  }, [slug]);

  async function initiateDownload(format: "jsonl" | "json" | "csv") {
    setGrantErr(null);
    setGranting(format);
    try {
      const r = await fetch(`/api/share/dataset/${encodeURIComponent(slug)}/download`, {
        method: "POST",
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const g: DownloadGrant = await r.json();
      setGrant(g);
      // Open the download_url in a new tab. The cloud surfaces 302 → fresh
      // signed URL when ready, 425 with Retry-After when still staging.
      if (g.download_url) {
        window.open(g.download_url, "_blank", "noreferrer");
      }
    } catch (e: unknown) {
      setGrantErr(e instanceof Error ? e.message : String(e));
    } finally {
      setGranting(null);
    }
  }

  function copyShareLink() {
    navigator.clipboard.writeText(window.location.href);
    setCopiedShare(true);
    window.setTimeout(() => setCopiedShare(false), 1800);
  }

  return (
    <Shell>
      <main className="relative z-10 mx-auto max-w-3xl px-6 py-10">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-honey-300/80">
          Dataset share · public link
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-stone-100">
          <Database size={24} className="mr-2 inline text-honey-200" />
          {pkg?.name || (err ? "Not found" : "Loading…")}
        </h1>

        {err && (
          <div className="mt-4 border border-red-400/30 bg-red-400/5 px-4 py-3 text-sm text-red-300">
            {err}
          </div>
        )}

        {pkg && (
          <>
            <p className="mt-2 font-mono text-xs text-stone-500">{pkg.slug}</p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <KV k="vertical" v={VERTICAL_LABEL[pkg.vertical] || pkg.vertical} />
              <KV k="tier" v={pkg.tier} />
              <KV k="package class" v={pkg.pkg_class} />
              <KV k="training pairs" v={pkg.pairs.toLocaleString()} />
              <KV
                k="deed-anchored"
                v={pkg.deed_anchored ? "✓ anchored" : "—"}
                emphasis={pkg.deed_anchored ? "honey" : "muted"}
              />
              <KV k="deed status" v={pkg.deed} />
            </div>

            {/* Crystal-clear data preview · samples + manifest */}
            <section className="mt-8">
              <div className="flex items-center justify-between gap-2">
                <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-honey-300/80">
                  Data preview · live from chain
                </h2>
                {samples && (
                  <span className="font-mono text-[10px] text-stone-500">
                    {formatBytes(samples.file_bytes)} · etag{" "}
                    {samples.file_etag.slice(0, 12)}…
                  </span>
                )}
              </div>

              {samplesStatus === "loading" && (
                <p className="mt-3 text-xs text-stone-500">Loading samples…</p>
              )}

              {samplesStatus === "preparing" && (
                <div className="mt-3 border border-amber-400/30 bg-amber-400/5 px-4 py-3 text-xs text-amber-200/90">
                  Dataset is not yet staged in the download bucket. Initiating a
                  download (button below) triggers the rails stager · samples
                  will appear here on the next page-view (≈2 min).
                </div>
              )}

              {samplesStatus === "error" && (
                <p className="mt-3 text-xs text-red-400">
                  Could not load samples · check DEFENDABLE_CLOUD_API_KEY env.
                </p>
              )}

              {samplesStatus === "ready" && samples && (
                <>
                  {/* Inferred schema · keys present in the first rows */}
                  <div className="mt-3 border border-line bg-ink/40 px-4 py-3">
                    <div className="font-mono text-[10px] uppercase tracking-widest text-stone-500">
                      schema · {inferSchema(samples.rows).length} fields
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {inferSchema(samples.rows).map((k) => (
                        <span
                          key={k}
                          className="border border-line bg-ink px-1.5 py-0.5 font-mono text-[10px] text-stone-300"
                        >
                          {k}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* First N rows · pretty JSON */}
                  <div className="mt-3 border border-line bg-black/60 px-4 py-3">
                    <div className="flex items-center justify-between gap-2 font-mono text-[10px] uppercase tracking-widest text-stone-500">
                      <span>
                        first {samples.count} row{samples.count === 1 ? "" : "s"}{" "}
                        · {samples.basename}
                      </span>
                      <span>JSONL</span>
                    </div>
                    <pre className="mt-3 max-h-96 overflow-auto font-mono text-[11px] leading-relaxed text-stone-300">
{samples.rows.map((row, i) => `// row ${i + 1}\n${JSON.stringify(row, null, 2)}`).join("\n\n")}
                    </pre>
                  </div>
                </>
              )}
            </section>

            {/* Share / copy */}
            <div className="mt-6 border border-honey-300/30 bg-honey-300/[0.04] px-4 py-3">
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-honey-300/80">
                <ShieldCheck size={13} /> Send this dataset
              </div>
              <p className="mt-2 text-xs text-stone-400">
                Anyone with this link sees the dataset card and can initiate a
                download. Each download mints a per-org receipt on the chain ·
                books-and-records by design.
              </p>
              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={copyShareLink}
                  className="inline-flex items-center gap-2 border border-line bg-ink px-3 py-2 text-sm text-stone-300 hover:border-stone-500"
                >
                  {copiedShare ? <Check size={14} /> : <Copy size={14} />}
                  {copiedShare ? "Copied" : "Copy share link"}
                </button>
                <Link
                  href="/graph"
                  className="inline-flex items-center gap-2 border border-line bg-ink px-3 py-2 text-sm text-stone-300 hover:border-stone-500"
                >
                  <GitBranch size={14} />
                  See on graph
                </Link>
              </div>
            </div>

            {/* Download */}
            <div className="mt-6 border border-line bg-ink/40 px-4 py-4">
              <div className="text-xs font-medium uppercase tracking-widest text-stone-400">
                Download
              </div>
              <p className="mt-2 text-xs leading-relaxed text-stone-500">
                Original format is <strong className="text-stone-300">JSONL</strong>{" "}
                (one training pair per line). Pulling JSONL mints a download
                receipt on the chain and 302-redirects to a fresh Tigris signed
                URL. CSV / JSON conversion are roadmap items.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => initiateDownload("jsonl")}
                  disabled={!!granting}
                  className="inline-flex items-center gap-2 border border-honey-300/50 bg-honey-300/15 px-4 py-2 text-sm font-semibold text-honey-100 hover:bg-honey-300/25 disabled:opacity-50"
                >
                  <Download size={14} />
                  {granting === "jsonl" ? "Minting receipt…" : "Download · JSONL"}
                </button>
                <button
                  disabled
                  className="inline-flex items-center gap-2 border border-line bg-ink px-4 py-2 text-sm text-stone-500"
                  title="Coming soon"
                >
                  <Download size={14} /> JSON · soon
                </button>
                <button
                  disabled
                  className="inline-flex items-center gap-2 border border-line bg-ink px-4 py-2 text-sm text-stone-500"
                  title="Coming soon"
                >
                  <Download size={14} /> CSV · soon
                </button>
              </div>

              {grantErr && (
                <div className="mt-3 text-xs text-red-400">{grantErr}</div>
              )}

              {grant && (
                <div className="mt-4 border-t border-line pt-4 text-xs">
                  <div className="font-mono text-[10px] uppercase tracking-widest text-honey-300/80">
                    ✓ receipt minted · org chain
                  </div>
                  <dl className="mt-2 space-y-1 font-mono text-[11px]">
                    <Row k="receipt_id" v={grant.receipt_id} />
                    <Row k="receipt_sha256" v={grant.receipt_sha256} />
                    <Row k="ready" v={grant.ready ? "yes" : "preparing"} />
                    <Row k="grant expires" v={grant.expires_at} />
                  </dl>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <a
                      href={grant.download_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-honey-200 hover:text-honey-100"
                    >
                      Open download <ArrowRight size={11} />
                    </a>
                    <a
                      href={grant.share_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-signal hover:text-stone-100"
                    >
                      Verify receipt on chain <ArrowRight size={11} />
                    </a>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </Shell>
  );
}

function KV({
  k,
  v,
  emphasis,
}: {
  k: string;
  v: string;
  emphasis?: "honey" | "muted";
}) {
  const tone =
    emphasis === "honey"
      ? "text-honey-200"
      : emphasis === "muted"
        ? "text-stone-500"
        : "text-stone-200";
  return (
    <div className="border border-line bg-ink/40 px-3 py-2">
      <div className="font-mono text-[10px] uppercase tracking-widest text-stone-500">
        {k}
      </div>
      <div className={`mt-1 text-sm ${tone}`}>{v}</div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-baseline gap-3">
      <dt className="w-32 shrink-0 text-stone-500">{k}</dt>
      <dd className="break-all text-stone-300">{v}</dd>
    </div>
  );
}
