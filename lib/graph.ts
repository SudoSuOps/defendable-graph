// Graph data layer · merges the seed-infra backbone with live receipts from
// DefendableCloud when an API key is configured. Falls back to seed-only
// when DEFENDABLE_CLOUD_API_KEY isn't set or the API is unreachable —
// preserves the demo experience for unauthenticated previews.
//
// The "infra backbone" is the always-on subset of seed data: organizations,
// operators, agents (DefendableOS/Cloud/Router/Worker), GPUs, compute nodes,
// and the in-house models. The "demo trace" entities (the cre_2026_000184
// assignment / verdict / receipt / deed / artifact) are HIDDEN when the live
// chain has receipts of its own — the live chain takes the wheel.

import {
  fetchDatasetCatalog,
  fetchPublicReceipt,
  fetchRecentReceipts,
  hasCloudAuth,
} from "./cloud";
import { projectChain, projectDatasets } from "./cloud-to-graph";
import {
  entities,
  events as seedEvents,
  proofTraces,
  relationships,
} from "./seed-data";

// IDs that belong to the demo CRE trace · removed from the merged graph
// when live receipts are present so we don't show stale demo data next to
// the live chain.
const DEMO_TRACE_IDS = new Set<string>([
  "client_demo",
  "assignment_cre_000184",
  "verdict_cre_honey",
  "receipt_9f2c",
  "deed_0001",
  "appraisal_aiov_0001",
  "artifact_final_ic_memo",
  // Rulebook is part of the always-on infra so we keep it.
]);

export async function getGraphData() {
  if (!hasCloudAuth()) {
    return { nodes: entities, edges: relationships };
  }
  // Fetch live chain + dataset catalog in parallel · datasets are a separate
  // member-only endpoint but cap-graceful: missing catalog just means no
  // dataset library nodes (chain still renders).
  const [live, catalog] = await Promise.all([
    fetchRecentReceipts(50),
    fetchDatasetCatalog(),
  ]);

  if (!live || live.rollups.length === 0) {
    // Auth configured but chain is empty · show the seed graph + (if available)
    // the dataset library overlay so members see something useful immediately.
    if (catalog) {
      const ds = projectDatasets(catalog);
      // Include the live-org root so the dataset categories edge to a real
      // anchor even when no receipts exist yet.
      const orgRoot: typeof entities = [
        {
          id: "live_org_root",
          type: "organization",
          name: "Your chain",
          status: "verified",
          description: "Live chain · awaiting first receipt.",
          metadata: { source: "GET /receipts/recent", limit: 0 },
        },
      ];
      return {
        nodes: [...entities, ...orgRoot, ...ds.nodes],
        edges: [...relationships, ...ds.edges],
      };
    }
    return { nodes: entities, edges: relationships };
  }

  const projected = projectChain(live.rollups);
  const datasetProjection = catalog ? projectDatasets(catalog) : { nodes: [], edges: [] };

  const filteredInfra = entities.filter((e) => !DEMO_TRACE_IDS.has(e.id));
  const filteredEdges = relationships.filter(
    (r) => !DEMO_TRACE_IDS.has(r.sourceId) && !DEMO_TRACE_IDS.has(r.targetId),
  );
  return {
    nodes: [...filteredInfra, ...projected.nodes, ...datasetProjection.nodes],
    edges: [...filteredEdges, ...projected.edges, ...datasetProjection.edges],
  };
}

export async function getEvents() {
  const seed = [...seedEvents];
  if (!hasCloudAuth()) {
    return seed.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  }
  const live = await fetchRecentReceipts(50);
  if (!live || live.rollups.length === 0) {
    return seed.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  }
  const projected = projectChain(live.rollups);
  return [...projected.events].sort(
    (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt),
  );
}

export async function getProofTrace(id: string) {
  // Live mode: if the id looks like a share token (typed bare or pasted),
  // fetch the public receipt directly. The Inspector panel calls into this.
  if (id && /^shr_[A-Za-z0-9_-]+$/.test(id) && hasCloudAuth()) {
    const r = await fetchPublicReceipt(id);
    if (r) return liveProofTrace(r);
  }

  // Demo / fallback path · the seeded CRE trace stays available so the
  // existing /proof/[id] surface keeps working when the chain is empty.
  const proof = proofTraces.find((item) => item.id === id) ?? proofTraces[0];
  const graph = await getGraphData();
  const byId = new Map(graph.nodes.map((node) => [node.id, node]));
  return {
    ...proof,
    client: byId.get(proof.clientId),
    assignment: byId.get(proof.assignmentId),
    router: byId.get("defendablerouter"),
    runtime: byId.get("agent_hermes"),
    model: byId.get(proof.modelId),
    datasets: proof.datasetIds.map((datasetId) => byId.get(datasetId)).filter(Boolean),
    worker: byId.get(proof.workerId),
    computeNode: byId.get(proof.computeNodeId),
    rulebook: byId.get(proof.rulebookId),
    verdict: byId.get(proof.verdictId),
    receipt: byId.get("receipt_9f2c"),
    artifact: byId.get(proof.artifactId),
    events: (await getEvents()).filter(
      (event) =>
        event.subjectId === proof.assignmentId ||
        event.receiptHash === proof.receiptHash,
    ),
  };
}

/** Shape a public-receipt response into the proof-trace contract the UI uses. */
function liveProofTrace(r: Awaited<ReturnType<typeof fetchPublicReceipt>>) {
  const payload = (r as NonNullable<typeof r>).payload || {};
  const schema = String(payload.schema || "");
  const cook = (payload as Record<string, unknown>).cook as Record<string, unknown> | undefined;
  const verdict = (payload as Record<string, unknown>).verdict as Record<string, unknown> | undefined;
  const model = (payload as Record<string, unknown>).model as Record<string, unknown> | undefined;
  const pkg = (payload as Record<string, unknown>).package as Record<string, unknown> | undefined;
  const run = (payload as Record<string, unknown>).run as Record<string, unknown> | undefined;
  const org = (payload as Record<string, unknown>).organization as Record<string, unknown> | undefined;
  const pinned = (payload as Record<string, unknown>).pinned_model as Record<string, unknown> | undefined;

  return {
    id: r!.receipt_id,
    receiptHash: r!.receipt_sha256,
    schema,
    verified: r!.verified,
    payload,
    organization: org,
    run,
    verdict,
    cook,
    model: model ?? pinned,
    package: pkg,
    pinnedModel: pinned,
    events: [],
  };
}
