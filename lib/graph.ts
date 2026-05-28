import { prisma } from "./prisma";
import { entities, events, proofTraces, relationships } from "./seed-data";

function safeJson<T>(value: string, fallback: T): T {
  try { return JSON.parse(value) as T; } catch { return fallback; }
}

function parseRecord<T extends { metadata?: unknown; datasetIds?: unknown }>(record: T): T {
  return {
    ...record,
    metadata: typeof record.metadata === "string" ? safeJson(record.metadata, {}) : record.metadata,
    datasetIds: typeof record.datasetIds === "string" ? safeJson(record.datasetIds, []) : record.datasetIds,
  };
}

export async function getGraphData() {
  try {
    const [dbEntities, dbRelationships] = await Promise.all([
      prisma.entity.findMany({ orderBy: { createdAt: "asc" } }),
      prisma.relationship.findMany({ orderBy: { createdAt: "asc" } }),
    ]);
    if (dbEntities.length) return { nodes: dbEntities.map(parseRecord), edges: dbRelationships.map(parseRecord) };
  } catch {}
  return { nodes: entities, edges: relationships };
}

export async function getEvents() {
  try {
    const dbEvents = await prisma.graphEvent.findMany({ orderBy: { createdAt: "desc" }, take: 80 });
    if (dbEvents.length) return dbEvents.map(parseRecord);
  } catch {}
  return [...events].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
}

export async function getProofTrace(id: string) {
  try {
    const proof = await prisma.proofTrace.findUnique({ where: { id } });
    if (proof) return hydrateProof(proof);
  } catch {}
  const proof = proofTraces.find((item) => item.id === id) ?? proofTraces[0];
  return hydrateProof(proof);
}

export async function hydrateProof(proof: { [key: string]: unknown }) {
  const graph = await getGraphData();
  const byId = new Map(graph.nodes.map((node) => [node.id, node]));
  const datasetIds = Array.isArray(proof.datasetIds) ? proof.datasetIds as string[] : safeJson(String(proof.datasetIds), [] as string[]);
  const metadata = typeof proof.metadata === "string" ? safeJson(String(proof.metadata), {}) : proof.metadata;
  return {
    ...proof,
    datasetIds,
    metadata,
    client: byId.get(proof.clientId as string),
    assignment: byId.get(proof.assignmentId as string),
    router: byId.get("defendablerouter"),
    runtime: byId.get("agent_hermes"),
    model: byId.get(proof.modelId as string),
    datasets: datasetIds.map((id) => byId.get(id)).filter(Boolean),
    worker: byId.get(proof.workerId as string),
    computeNode: byId.get(proof.computeNodeId as string),
    rulebook: byId.get(proof.rulebookId as string),
    verdict: byId.get(proof.verdictId as string),
    receipt: byId.get("receipt_9f2c"),
    artifact: byId.get(proof.artifactId as string),
    events: (await getEvents()).filter((event) => event.subjectId === proof.assignmentId || event.receiptHash === proof.receiptHash),
  };
}
