"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Database, GitBranch, Share2 } from "lucide-react";
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

interface DatasetCatalog {
  version: string;
  generated_at: string | null;
  packages_sha256: string | null;
  scorecard: { total_packages: number; total_pairs: number; deed_anchored: number };
  verticals: Record<string, { packages: number; pairs: number; usd: number | null }>;
  packages: DatasetPackage[];
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

export default function DatasetsPage() {
  const [catalog, setCatalog] = useState<DatasetCatalog | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [vFilter, setVFilter] = useState<string>("all");
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetch("/api/datasets")
      .then((r) => (r.ok ? r.json() : Promise.reject(r.statusText)))
      .then(setCatalog)
      .catch((e) => setErr(String(e)));
  }, []);

  const filtered = useMemo(() => {
    if (!catalog) return [] as DatasetPackage[];
    let list = catalog.packages;
    if (vFilter !== "all") list = list.filter((p) => p.vertical === vFilter);
    if (query) {
      const q = query.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.slug.toLowerCase().includes(q) ||
          p.vertical.toLowerCase().includes(q),
      );
    }
    return list;
  }, [catalog, vFilter, query]);

  return (
    <Shell>
      <main className="relative z-10 mx-auto max-w-7xl px-6 py-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-honey-300/80">
              Datasets · live from defendable-cloud
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-stone-100">
              The members-only library.
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-stone-400">
              99 packages · 12 verticals · 3.35M training pairs · books-and-records
              hashed. Click any dataset to open a public share view; download
              initiates a per-org receipt on the chain.
            </p>
          </div>
          {catalog?.packages_sha256 && (
            <div className="text-right font-mono text-xs text-stone-500">
              <div>{catalog.version} · generated{" "}
                {catalog.generated_at
                  ? new Date(catalog.generated_at).toLocaleDateString()
                  : "—"}
              </div>
              <div>
                sha256 ·{" "}
                <span className="text-stone-300">
                  {catalog.packages_sha256.slice(0, 16)}…
                </span>
              </div>
            </div>
          )}
        </div>

        {err && (
          <div className="mt-6 rounded-md border border-red-400/30 bg-red-400/5 px-4 py-3 text-sm text-red-300">
            {err}
            {err.includes("503") &&
              " · DEFENDABLE_CLOUD_API_KEY env var not set on this deploy"}
          </div>
        )}

        {!catalog && !err && (
          <p className="mt-8 text-sm text-stone-500">Loading catalog…</p>
        )}

        {catalog && (
          <>
            {/* Scorecard */}
            <div className="mt-8 grid grid-cols-3 gap-4">
              <Stat label="Packages" value={String(catalog.scorecard.total_packages)} />
              <Stat
                label="Training pairs"
                value={catalog.scorecard.total_pairs.toLocaleString()}
              />
              <Stat
                label="Deed-anchored"
                value={`${catalog.scorecard.deed_anchored} / ${catalog.scorecard.total_packages}`}
              />
            </div>

            {/* Filter + search */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name, slug, vertical…"
                className="min-w-64 flex-1 border border-line bg-ink/70 px-3 py-2 text-sm outline-none placeholder:text-stone-600"
              />
              <select
                value={vFilter}
                onChange={(e) => setVFilter(e.target.value)}
                className="border border-line bg-ink px-3 py-2 text-sm text-stone-300"
              >
                <option value="all">all verticals · {catalog.packages.length}</option>
                {Object.entries(catalog.verticals)
                  .sort((a, b) => b[1].pairs - a[1].pairs)
                  .map(([v, info]) => (
                    <option key={v} value={v}>
                      {VERTICAL_LABEL[v] || v} · {info.packages}
                    </option>
                  ))}
              </select>
              <Link
                href="/graph"
                className="inline-flex items-center gap-2 border border-line bg-ink px-3 py-2 text-sm text-stone-300 hover:border-stone-500"
              >
                <GitBranch size={14} /> Render on graph
              </Link>
            </div>

            {/* Vertical chips */}
            <div className="mt-4 flex flex-wrap gap-2">
              {Object.entries(catalog.verticals)
                .sort((a, b) => b[1].pairs - a[1].pairs)
                .map(([v, info]) => (
                  <button
                    key={v}
                    onClick={() => setVFilter(v)}
                    className={`border px-3 py-1 font-mono text-xs ${
                      vFilter === v
                        ? "border-honey-300/50 bg-honey-300/10 text-honey-200"
                        : "border-line bg-ink/40 text-stone-400 hover:border-stone-500"
                    }`}
                  >
                    {VERTICAL_LABEL[v] || v} · {info.packages}
                  </button>
                ))}
            </div>

            {/* Package table */}
            <div className="mt-6 overflow-hidden border border-line bg-ink/40">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-line text-xs uppercase tracking-widest text-stone-500">
                  <tr>
                    <th className="px-4 py-3">Package</th>
                    <th className="px-4 py-3">Vertical</th>
                    <th className="px-4 py-3">Tier</th>
                    <th className="px-4 py-3 text-right">Pairs</th>
                    <th className="px-4 py-3 text-right">Deed</th>
                    <th className="px-4 py-3 text-right">Share</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line/70">
                  {filtered.slice(0, 200).map((p) => (
                    <tr key={p.slug} className="hover:bg-ink/60">
                      <td className="px-4 py-3">
                        <Link
                          href={`/share/dataset/${p.slug}`}
                          className="block group"
                        >
                          <div className="font-medium text-stone-100 group-hover:text-honey-200">
                            <Database size={12} className="mr-1.5 inline" />
                            {p.name}
                          </div>
                          <div className="mt-0.5 font-mono text-[10px] text-stone-500">
                            {p.slug}
                          </div>
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-stone-400">
                        {VERTICAL_LABEL[p.vertical] || p.vertical}
                      </td>
                      <td className="px-4 py-3">
                        <span className="border border-honey-300/30 bg-honey-300/[0.08] px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-honey-200">
                          {p.tier}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-xs text-stone-400">
                        {p.pairs.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {p.deed_anchored ? (
                          <span className="font-mono text-[10px] text-emerald-300/80">
                            ✓ anchored
                          </span>
                        ) : (
                          <span className="font-mono text-[10px] text-stone-600">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/share/dataset/${p.slug}`}
                          className="inline-flex items-center gap-1 font-mono text-[10px] text-signal hover:text-stone-100"
                        >
                          <Share2 size={11} /> share
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filtered.length > 200 && (
              <p className="mt-2 text-xs text-stone-500">
                Showing first 200 of {filtered.length} · refine the filter to see more.
              </p>
            )}
          </>
        )}
      </main>
    </Shell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-line bg-ink/40 px-4 py-4">
      <div className="text-2xl font-semibold text-stone-100">{value}</div>
      <div className="mt-1 font-mono text-[10px] uppercase tracking-widest text-stone-500">
        {label}
      </div>
    </div>
  );
}
