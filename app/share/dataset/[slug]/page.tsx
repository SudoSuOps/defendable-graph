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

  useEffect(() => {
    fetch(`/api/share/dataset/${encodeURIComponent(slug)}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(`HTTP ${r.status}`)))
      .then(setPkg)
      .catch((e) => setErr(String(e)));
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
