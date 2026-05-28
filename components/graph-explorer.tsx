"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Background, Controls, MiniMap, ReactFlow, type Edge, type Node } from "@xyflow/react";
import { AnimatePresence, motion } from "framer-motion";
import { Activity, CircleDot, Inspect, RadioTower, Search, Shuffle } from "lucide-react";
import { Badge, JsonBlock, Metric } from "@/components/chrome";
type GraphEntity = { id: string; type: string; name: string; status: string; description: string; metadata: unknown };
type GraphRelationship = { id: string; sourceId: string; targetId: string; type: string; metadata: unknown };
type GraphEvent = { id: string; eventType: string; actorId?: string | null; subjectId?: string | null; receiptHash?: string | null; status: string; metadata: unknown; createdAt: string | Date };

type GraphPayload = { nodes: GraphEntity[]; edges: GraphRelationship[] };

type InspectorNode = GraphEntity & { relationships: GraphRelationship[] };

const typeColors: Record<string, string> = {
  client: "#45d3ff", assignment: "#f8d46c", agent: "#8bd4ff", model: "#b7a2ff", dataset: "#5ee39b", rulebook: "#f8d46c", verdict: "#e6ab2a", receipt: "#5ee39b", artifact: "#e8edf7", worker: "#45d3ff", compute_node: "#ffb86b", gpu: "#ff7a45", deed: "#e6ab2a", appraisal: "#f8d46c", operator: "#e8edf7", organization: "#e8edf7",
};

const layouts: Record<string, Record<string, { x: number; y: number }>> = {
  ecosystem: {
    org_swarm_bee: { x: 40, y: 170 }, defendableos: { x: 290, y: 80 }, defendablecloud: { x: 290, y: 260 }, defendablerouter: { x: 560, y: 170 }, defendableworker: { x: 830, y: 170 }, node_swarmrails_dual_6000: { x: 1080, y: 170 },
  },
  proof: {
    client_demo: { x: 20, y: 180 }, assignment_cre_000184: { x: 250, y: 180 }, agent_hermes: { x: 480, y: 80 }, model_atlas_cre_27b: { x: 720, y: 80 }, dataset_royal_jelly_cre_v1: { x: 720, y: 260 }, rulebook_cre_ic_v1: { x: 480, y: 310 }, verdict_honey: { x: 720, y: 420 }, receipt_9f2c: { x: 960, y: 420 }, artifact_final_ic_memo: { x: 960, y: 260 }, deed_0001: { x: 1180, y: 420 },
  },
  compute: {
    defendablerouter: { x: 60, y: 180 }, defendableworker: { x: 320, y: 180 }, worker_b2a2: { x: 570, y: 180 }, node_swarmrails_dual_6000: { x: 830, y: 180 }, gpu_6000_0: { x: 1080, y: 90 }, gpu_6000_1: { x: 1080, y: 270 }, op_microscaler: { x: 830, y: 380 },
  },
  dataset: {
    model_swarmcurator_9b: { x: 220, y: 260 }, dataset_royal_jelly_cre_v1: { x: 500, y: 260 }, model_atlas_cre_27b: { x: 780, y: 160 }, assignment_cre_000184: { x: 1060, y: 260 }, artifact_final_ic_memo: { x: 1320, y: 260 },
  },
};

export default function GraphExplorer({ graph, events }: { graph: GraphPayload; events: GraphEvent[] }) {
  const [query, setQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [layout, setLayout] = useState<keyof typeof layouts>("ecosystem");
  const [live, setLive] = useState(true);
  const [activeEvent, setActiveEvent] = useState(0);
  const [selected, setSelected] = useState<InspectorNode | null>(null);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "/") { event.preventDefault(); document.getElementById("graph-search")?.focus(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!live) return;
    const timer = setInterval(() => setActiveEvent((value) => (value + 1) % events.length), 2600);
    return () => clearInterval(timer);
  }, [events.length, live]);

  const visibleIds = useMemo(() => new Set(graph.nodes.filter((node) => (selectedType === "all" || node.type === selectedType) && node.name.toLowerCase().includes(query.toLowerCase())).map((node) => node.id)), [graph.nodes, query, selectedType]);

  const flowNodes: Node[] = useMemo(() => graph.nodes.filter((node) => visibleIds.has(node.id)).map((node, index) => {
    const pinned = layouts[layout][node.id];
    const isHot = events[activeEvent]?.actorId === node.id || events[activeEvent]?.subjectId === node.id;
    return { id: node.id, position: pinned ?? { x: 120 + (index % 5) * 250, y: 80 + Math.floor(index / 5) * 150 }, data: { label: <GraphNode node={node} hot={isHot} /> }, type: "default", style: { width: 210, border: "none", background: "transparent" } };
  }), [activeEvent, events, graph.nodes, layout, visibleIds]);

  const flowEdges: Edge[] = useMemo(() => graph.edges.filter((edge) => visibleIds.has(edge.sourceId) && visibleIds.has(edge.targetId)).map((edge) => ({ id: edge.id, source: edge.sourceId, target: edge.targetId, label: edge.type, animated: true, className: "edge-flow", style: { stroke: "rgba(69,211,255,0.56)", strokeWidth: 1.5 }, labelStyle: { fill: "#9fb2d0", fontSize: 10, fontFamily: "monospace" }, labelBgStyle: { fill: "rgba(5,7,13,0.9)" } })), [graph.edges, visibleIds]);

  const nodeTypes = useMemo(() => ["all", ...Array.from(new Set(graph.nodes.map((node) => node.type))).sort()], [graph.nodes]);

  const inspect = useCallback((_event: unknown, node: Node) => {
    const entity = graph.nodes.find((item) => item.id === node.id);
    if (!entity) return;
    setSelected({ ...entity, relationships: graph.edges.filter((edge) => edge.sourceId === entity.id || edge.targetId === entity.id) });
  }, [graph.edges, graph.nodes]);

  const simulate = () => setActiveEvent(Math.floor(Math.random() * events.length));

  return <main className="relative z-10 grid h-[calc(100vh-73px)] grid-rows-[auto_1fr] overflow-hidden"><section className="border-b border-line bg-panel/45 px-5 py-4"><div className="flex flex-wrap items-center gap-3"><Metric label="nodes" value={String(graph.nodes.length)} /><Metric label="edges" value={String(graph.edges.length)} /><div className="flex min-w-64 flex-1 items-center gap-2 border border-line bg-ink/70 px-3 py-2"><Search size={16} className="text-stone-500" /><input id="graph-search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search graph nodes..." className="w-full bg-transparent text-sm outline-none placeholder:text-stone-600" /></div><select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} className="border border-line bg-ink px-3 py-2 text-sm text-stone-300"><>{nodeTypes.map((type) => <option key={type} value={type}>{type}</option>)}</></select><div className="flex gap-2">{Object.keys(layouts).map((item) => <button key={item} onClick={() => setLayout(item as keyof typeof layouts)} className={`border px-3 py-2 text-xs uppercase tracking-[0.12em] ${layout === item ? "border-honey-300/50 bg-honey-300/10 text-honey-200" : "border-line bg-ink text-stone-400"}`}>{item}</button>)}</div><button onClick={() => setLive(!live)} className={`inline-flex items-center gap-2 border px-3 py-2 text-sm ${live ? "border-verified/40 bg-verified/10 text-verified" : "border-line bg-ink text-stone-400"}`}><RadioTower size={15} />Live</button><button onClick={simulate} className="inline-flex items-center gap-2 border border-line bg-ink px-3 py-2 text-sm text-stone-300"><Shuffle size={15} />Simulate</button></div></section><section className="grid min-h-0 grid-cols-[1fr_390px]"><div className="relative min-w-0"><ReactFlow nodes={flowNodes} edges={flowEdges} onNodeClick={inspect} fitView proOptions={{ hideAttribution: true }}><Background gap={28} color="rgba(69,211,255,0.18)" /><MiniMap nodeColor={(node) => typeColors[(graph.nodes.find((item) => item.id === node.id)?.type ?? "") as string] ?? "#45d3ff"} /><Controls /></ReactFlow><LiveEvent event={events[activeEvent]} /></div><Inspector selected={selected} /></section></main>;
}

function GraphNode({ node, hot }: { node: GraphEntity; hot: boolean }) {
  const color = typeColors[node.type] ?? "#45d3ff";
  return <div className={`relative border bg-panel/95 p-3 text-left shadow-glow ${hot ? "animate-pulseNode" : ""}`} style={{ borderColor: `${color}88`, boxShadow: hot ? `0 0 34px ${color}44` : undefined }}><div className="flex items-center justify-between gap-2"><span className="font-mono text-[10px] uppercase tracking-[0.16em]" style={{ color }}>{node.type}</span><span className="h-2 w-2 rounded-full" style={{ background: color, boxShadow: `0 0 18px ${color}` }} /></div><div className="mt-2 text-sm font-semibold text-stone-100">{node.name}</div><div className="mt-2 truncate text-xs text-stone-500">{node.status}</div></div>;
}

function LiveEvent({ event }: { event?: GraphEvent }) {
  if (!event) return null;
  return <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="absolute bottom-5 left-5 max-w-xl border border-signal/30 bg-ink/90 p-4 shadow-glow backdrop-blur"><div className="flex items-center gap-2"><Activity size={15} className="text-signal" /><span className="font-mono text-xs uppercase tracking-[0.16em] text-signal">live graph event</span></div><div className="mt-2 text-sm text-stone-200">{event.eventType}</div><div className="mt-1 font-mono text-xs text-stone-500">{event.receiptHash ?? event.status}</div></motion.div>;
}

function Inspector({ selected }: { selected: InspectorNode | null }) {
  return <aside className="min-h-0 overflow-y-auto border-l border-line bg-panel/80 p-5"><div className="flex items-center gap-2 text-stone-500"><Inspect size={16} /><span className="font-mono text-xs uppercase tracking-[0.18em]">Inspector</span></div><AnimatePresence mode="wait">{selected ? <motion.div key={selected.id} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }}><h2 className="mt-5 text-2xl font-semibold text-stone-50">{selected.name}</h2><div className="mt-3 flex flex-wrap gap-2"><Badge tone="blue">{selected.type}</Badge><Badge tone={selected.status === "verified" ? "green" : selected.status === "maintenance" ? "honey" : "default"}>{selected.status}</Badge></div><p className="mt-5 text-sm leading-relaxed text-stone-400">{selected.description}</p><h3 className="mt-7 font-mono text-xs uppercase tracking-[0.18em] text-honey-300">Metadata</h3><div className="mt-3"><JsonBlock data={selected.metadata} /></div><h3 className="mt-7 font-mono text-xs uppercase tracking-[0.18em] text-honey-300">Connected relationships</h3><div className="mt-3 space-y-2">{selected.relationships.map((rel) => <div key={rel.id} className="border border-line bg-ink/60 p-3"><div className="font-mono text-xs text-signal">{rel.type}</div><div className="mt-1 text-xs text-stone-500">{rel.sourceId} → {rel.targetId}</div></div>)}</div></motion.div> : <div className="mt-8 border border-dashed border-line p-6 text-sm leading-relaxed text-stone-500"><CircleDot className="mb-3 text-stone-600" />Click a node to inspect its proof role, metadata, and relationships.</div>}</AnimatePresence></aside>;
}
