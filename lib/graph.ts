import { entities, events, proofTraces, relationships } from "./seed-data";

export async function getGraphData() {
  return { nodes: entities, edges: relationships };
}

export async function getEvents() {
  return [...events].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
}

export async function getProofTrace(id: string) {
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
    events: (await getEvents()).filter((event) => event.subjectId === proof.assignmentId || event.receiptHash === proof.receiptHash),
  };
}
