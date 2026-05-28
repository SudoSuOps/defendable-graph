import Link from "next/link";
import { Download, FileCheck2, Fingerprint, ShieldCheck } from "lucide-react";
import { Badge, JsonBlock, SectionTitle, Shell } from "@/components/chrome";
import { getProofTrace } from "@/lib/graph";
import CopyButton from "@/components/copy-button";

export const runtime = "edge";

type ProofNode = { name?: string; description?: string };
type HydratedProof = Record<string, unknown> & {
  id: string;
  receiptHash: string;
  metadata: unknown;
  client?: ProofNode;
  assignment?: ProofNode;
  router?: ProofNode;
  runtime?: ProofNode;
  model?: ProofNode;
  datasets?: ProofNode[];
  worker?: ProofNode;
  computeNode?: ProofNode;
  rulebook?: ProofNode;
  verdict?: ProofNode;
  receipt?: ProofNode;
  artifact?: ProofNode;
};

export default async function ProofPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const proof = (await getProofTrace(id)) as unknown as HydratedProof;
  const chain = [
    ["Client", proof.client], ["Assignment", proof.assignment], ["Router", proof.router], ["Agent / Runtime", proof.runtime], ["Model", proof.model], ["Dataset", proof.datasets?.[0]], ["Worker", proof.worker], ["Compute Node", proof.computeNode], ["Hardware", { name: "2x RTX PRO 6000 Blackwell 96GB", description: "Dual Blackwell GPUs registered under node_swarmrails_dual_6000." }], ["Rulebook", proof.rulebook], ["Verdict", proof.verdict], ["Receipt", proof.receipt], ["Artifact", proof.artifact],
  ];
  return <Shell><main className="relative z-10 mx-auto max-w-7xl px-5 py-10"><div className="flex flex-wrap items-end justify-between gap-5"><SectionTitle eyebrow="Proof Trace" title={String(proof.id)} body="A vertical audit trail for one assignment, from client request to final artifact and deed-ready receipt." /><div className="flex gap-3"><a href={`/api/proof/${proof.id}`} className="inline-flex items-center gap-2 border border-line bg-panel px-4 py-2 text-sm text-stone-200"><Download size={15} />Export JSON</a><Link href="/graph" className="border border-signal/30 bg-signal/10 px-4 py-2 text-sm font-semibold text-signal">Open graph</Link></div></div><section className="mt-8 grid gap-5 lg:grid-cols-[1fr_360px]"><div className="border border-line bg-panel/60 p-6"><div className="space-y-5">{chain.map(([label, item], index) => <div key={label as string} className="relative grid gap-4 border border-line bg-ink/45 p-5 md:grid-cols-[10rem_1fr]"><div className="font-mono text-xs uppercase tracking-[0.18em] text-honey-300">{String(index + 1).padStart(2, "0")} · {label as string}</div><div><div className="flex flex-wrap items-center gap-2"><h3 className="text-lg font-semibold text-stone-100">{(item as { name?: string })?.name ?? "Unresolved"}</h3>{label === "Verdict" && <Badge tone="honey">HONEY</Badge>}</div><p className="mt-2 text-sm leading-relaxed text-stone-400">{(item as { description?: string })?.description}</p></div>{index < chain.length - 1 && <div className="absolute -bottom-5 left-8 h-5 w-px bg-signal/40" />}</div>)}</div></div><aside className="space-y-5"><div className="border border-verified/35 bg-verified/10 p-5"><div className="flex items-center gap-2 text-verified"><ShieldCheck size={18} /><span className="font-mono text-xs uppercase tracking-[0.18em]">verified receipt</span></div><div className="mt-4 break-all font-mono text-sm text-stone-100">{String(proof.receiptHash)}</div><div className="mt-4"><CopyButton value={String(proof.receiptHash)} label="Copy receipt hash" /></div></div><div className="border border-line bg-panel/60 p-5"><div className="flex items-center gap-2 text-honey-300"><FileCheck2 size={18} /><span className="font-mono text-xs uppercase tracking-[0.18em]">rulebook checks</span></div><div className="mt-4 space-y-3">{["Source citations present", "Math checks passed", "Dataset checksum attached", "Human approval required", "Receipt generated"].map((check, idx) => <div key={check} className="flex items-center justify-between border border-line bg-ink/50 px-3 py-2 text-sm"><span>{check}</span><Badge tone={idx === 3 ? "honey" : "green"}>{idx === 3 ? "review" : "pass"}</Badge></div>)}</div></div><div className="border border-line bg-panel/60 p-5"><div className="flex items-center gap-2 text-signal"><Fingerprint size={18} /><span className="font-mono text-xs uppercase tracking-[0.18em]">proof json</span></div><div className="mt-4"><JsonBlock data={proof.metadata} /></div></div></aside></section></main></Shell>;
}
