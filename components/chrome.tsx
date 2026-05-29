import Link from "next/link";
import { Activity, GitBranch, RadioTower } from "lucide-react";

export function Shell({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen overflow-hidden bg-ink text-stone-100"><Ambient /><Nav />{children}</div>;
}

export function Ambient() {
  return <><div className="pointer-events-none fixed inset-0 graph-grid opacity-[0.18]" /><div className="pointer-events-none fixed left-1/2 top-0 h-[38rem] w-[52rem] -translate-x-1/2 rounded-full bg-signal/10 blur-3xl" /><div className="pointer-events-none fixed bottom-[-10rem] right-[-8rem] h-[28rem] w-[28rem] rounded-full bg-honey-300/10 blur-3xl" /></>;
}

export function Nav() {
  return <header className="sticky top-0 z-50 border-b border-line/80 bg-ink/80 backdrop-blur-xl"><nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4"><Link href="/" className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center border border-honey-300/40 bg-honey-300/10 text-honey-200"><GitBranch size={18} /></span><span><span className="block text-sm font-semibold tracking-tight">DefendableGraph</span><span className="block font-mono text-[10px] uppercase tracking-[0.2em] text-stone-500">living proof network</span></span></Link><div className="hidden items-center gap-6 text-sm text-stone-400 md:flex"><Link href="/graph" className="hover:text-stone-100">Graph</Link><Link href="/datasets" className="hover:text-stone-100">Datasets</Link><Link href="/proof/cre_2026_000184" className="hover:text-stone-100">Proof Trace</Link><Link href="/events" className="hover:text-stone-100">Events</Link></div><Link href="/graph" className="inline-flex items-center gap-2 rounded-md border border-signal/30 bg-signal/10 px-4 py-2 text-sm font-semibold text-signal hover:bg-signal/15"><RadioTower size={15} />Enter</Link></nav></header>;
}

export function Badge({ children, tone = "default" }: { children: React.ReactNode; tone?: "default" | "honey" | "green" | "red" | "blue" }) {
  const tones = { default: "border-stone-700 bg-stone-900/70 text-stone-300", honey: "border-honey-300/40 bg-honey-300/10 text-honey-200", green: "border-verified/40 bg-verified/10 text-verified", red: "border-critical/40 bg-critical/10 text-critical", blue: "border-signal/40 bg-signal/10 text-signal" };
  return <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.14em] ${tones[tone]}`}>{children}</span>;
}

export function Metric({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return <div className="border border-line bg-panel/70 p-4 shadow-glow"><div className="flex items-center gap-2 text-stone-500">{icon ?? <Activity size={14} />}<span className="font-mono text-[10px] uppercase tracking-[0.18em]">{label}</span></div><div className="mt-2 text-xl font-semibold text-stone-100">{value}</div></div>;
}

export function JsonBlock({ data }: { data: unknown }) {
  return <pre className="max-h-72 overflow-auto border border-line bg-black/35 p-3 text-xs leading-relaxed text-stone-300"><code>{JSON.stringify(data, null, 2)}</code></pre>;
}

export function SectionTitle({ eyebrow, title, body }: { eyebrow: string; title: string; body?: string }) {
  return <div><div className="font-mono text-xs uppercase tracking-[0.22em] text-honey-300">{eyebrow}</div><h2 className="mt-3 text-3xl font-semibold tracking-tight text-stone-50 md:text-5xl">{title}</h2>{body && <p className="mt-4 max-w-2xl text-base leading-relaxed text-stone-400">{body}</p>}</div>;
}
