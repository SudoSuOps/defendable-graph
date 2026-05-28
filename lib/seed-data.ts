export type EntityType =
  | "client" | "assignment" | "agent" | "model" | "dataset" | "rulebook" | "verdict" | "receipt"
  | "artifact" | "worker" | "compute_node" | "gpu" | "deed" | "appraisal" | "operator" | "organization";

export type EntitySeed = {
  id: string;
  type: EntityType;
  name: string;
  status: "verified" | "active" | "running" | "queued" | "maintenance" | "archived" | "warning";
  description: string;
  metadata: Record<string, unknown>;
};

export type RelationshipSeed = {
  id: string;
  sourceId: string;
  targetId: string;
  type: string;
  metadata: Record<string, unknown>;
};

export type EventSeed = {
  id: string;
  eventType: string;
  actorId?: string;
  subjectId?: string;
  receiptHash?: string;
  status: string;
  metadata: Record<string, unknown>;
  createdAt: string;
};

export const entities: EntitySeed[] = [
  { id: "org_swarm_bee", type: "organization", name: "Swarm & Bee", status: "verified", description: "Operator organization behind the Defendable ecosystem.", metadata: { jurisdiction: "Florida", duns: "138652395", domain: "swarmandbee.ai" } },
  { id: "op_microscaler", type: "operator", name: "MicroScaler Operator", status: "active", description: "Local operator responsible for owned compute and proof execution lanes.", metadata: { role: "rig_operator", region: "US-East", contact: "build@defendableos.com" } },
  { id: "client_demo", type: "client", name: "Swarm & Bee Demo Client", status: "verified", description: "Demo client used for the seeded CRE proof trace.", metadata: { segment: "commercial_real_estate", risk_profile: "review_required" } },
  { id: "defendableos", type: "agent", name: "DefendableOS", status: "active", description: "Proof-of-execution operating layer for agentic work.", metadata: { surface: "defendableos.com", doctrine: "inputs_to_receipts" } },
  { id: "defendablecloud", type: "agent", name: "DefendableCloud", status: "active", description: "Member compute and dataset platform for private AI execution.", metadata: { membership_usd: 100, datasets_target: 2000000 } },
  { id: "defendablerouter", type: "agent", name: "DefendableRouter", status: "running", description: "Control plane for members, datasets, compute jobs, workers, and receipts.", metadata: { api: "FastAPI", receipts: "JSONL/Postgres-ready", worker_contract: "v0.2" } },
  { id: "defendableworker", type: "worker", name: "DefendableWorker", status: "active", description: "Worker agent contract for owned rigs that lease jobs from the router.", metadata: { heartbeat_seconds: 30, auth: "bearer_token_hash", lease_ttl_seconds: 600 } },
  { id: "assignment_cre_000184", type: "assignment", name: "CRE Assignment 000184", status: "running", description: "Commercial real estate investment committee memo generation and review assignment.", metadata: { proof_id: "cre_2026_000184", requested_by: "Swarm & Bee Demo Client", lane: "CRE underwriting" } },
  { id: "appraisal_aiov_0001", type: "appraisal", name: "AIOV Compute Appraisal 0001", status: "verified", description: "Appraisal record for compute-backed proof value and infrastructure usage.", metadata: { appraisal_method: "AIOV", amount_usd: 7500, confidence: 0.91 } },
  { id: "agent_hermes", type: "agent", name: "Hermes Runtime", status: "running", description: "Runtime lane that executes the CRE assignment and emits graph events.", metadata: { runtime: "Hermes", tool_mode: "controlled", last_invoked: "2026-05-28T18:21:00Z" } },
  { id: "model_atlas_cre_27b", type: "model", name: "Atlas CRE 27B", status: "verified", description: "CRE-focused model used for investment memo synthesis and review.", metadata: { parameters: "27B", specialization: "commercial_real_estate", lineage: ["Royal Jelly CRE v1"] } },
  { id: "model_swarmcurator_9b", type: "model", name: "SwarmCurator 9B", status: "active", description: "Curator model for dataset QA, deduplication, and provenance scoring.", metadata: { parameters: "9B", role: "dataset_curation" } },
  { id: "dataset_royal_jelly_cre_v1", type: "dataset", name: "Royal Jelly CRE v1", status: "verified", description: "Curated CRE dataset lineage used to support the assignment.", metadata: { quality_tier: "royal_jelly", records: 184000, checksum: "sha256:royal-jelly-cre-demo" } },
  { id: "rulebook_cre_ic_v1", type: "rulebook", name: "CRE IC Memo Rulebook v1", status: "verified", description: "Rulebook for investment committee memo structure, sourcing, risk, and verdict checks.", metadata: { checks: 12, passed: 11, review_required: 1 } },
  { id: "verdict_honey", type: "verdict", name: "Tribunal Verdict: HONEY", status: "verified", description: "Final verdict indicating the artifact is useful, sourced, and defensible with review notes.", metadata: { verdict: "HONEY", confidence: 0.94, reviewer: "Tribunal" } },
  { id: "receipt_9f2c", type: "receipt", name: "Receipt sha256:9f2c-demo-proof-receipt", status: "verified", description: "Checksum receipt tying the proof trace to the final artifact and decision path.", metadata: { sha256: "9f2c-demo-proof-receipt", receipt_type: "compute_job", canonical_json: true } },
  { id: "artifact_final_ic_memo", type: "artifact", name: "Final IC Memo Artifact", status: "verified", description: "Final commercial real estate investment committee memo artifact.", metadata: { uri: "s3://defendable-artifacts/demo/cre_000184/final_ic_memo.pdf", sha256: "sha256:artifact-final-ic-memo" } },
  { id: "deed_0001", type: "deed", name: "Defendable Deed 0001", status: "verified", description: "Ownership and proof record connecting the appraisal, receipt, and final artifact.", metadata: { deed_id: "DDEED-0001", owner: "Swarm & Bee", anchor_status: "demo" } },
  { id: "node_swarmrails_dual_6000", type: "compute_node", name: "node_swarmrails_dual_6000", status: "maintenance", description: "Dual RTX PRO 6000 Blackwell rig registered as a Defendable host.", metadata: { hostname: "swarmrails", cpu: "Xeon Sapphire Rapids", ram_gb: 256, gpus: 2, last_heartbeat: "2026-05-28T16:04:00Z" } },
  { id: "worker_b2a2", type: "worker", name: "worker_b2a2ecf54100456aac77d6b03847cc8e", status: "maintenance", description: "DefendableWorker registration for swarmrails dual Blackwell host.", metadata: { worker_id: "worker_b2a2ecf54100456aac77d6b03847cc8e", auth: "token_hash_stored", capabilities: ["fine_tune", "inference", "eval", "dataset_build"] } },
  { id: "gpu_6000_0", type: "gpu", name: "RTX PRO 6000 Blackwell 96GB GPU 0", status: "active", description: "First Blackwell GPU on the swarmrails host.", metadata: { sku: "rtx6000_blackwell_96gb", vram_gb: 96, hourly_rate_usd: 5 } },
  { id: "gpu_6000_1", type: "gpu", name: "RTX PRO 6000 Blackwell 96GB GPU 1", status: "active", description: "Second Blackwell GPU on the swarmrails host.", metadata: { sku: "rtx6000_blackwell_96gb", vram_gb: 96, hourly_rate_usd: 5 } },
];

export const relationships: RelationshipSeed[] = [
  { id: "rel_001", sourceId: "org_swarm_bee", targetId: "defendableos", type: "OWNS", metadata: {} },
  { id: "rel_002", sourceId: "org_swarm_bee", targetId: "defendablecloud", type: "OWNS", metadata: {} },
  { id: "rel_003", sourceId: "defendablecloud", targetId: "defendablerouter", type: "POWERED_BY", metadata: {} },
  { id: "rel_004", sourceId: "client_demo", targetId: "assignment_cre_000184", type: "REQUESTED", metadata: { requested_at: "2026-05-28T18:00:00Z" } },
  { id: "rel_005", sourceId: "assignment_cre_000184", targetId: "defendablerouter", type: "ROUTED_BY", metadata: {} },
  { id: "rel_006", sourceId: "assignment_cre_000184", targetId: "agent_hermes", type: "EXECUTED_BY", metadata: {} },
  { id: "rel_007", sourceId: "agent_hermes", targetId: "model_atlas_cre_27b", type: "USES_MODEL", metadata: {} },
  { id: "rel_008", sourceId: "model_atlas_cre_27b", targetId: "dataset_royal_jelly_cre_v1", type: "TRAINED_ON", metadata: { lineage_strength: "high" } },
  { id: "rel_009", sourceId: "assignment_cre_000184", targetId: "dataset_royal_jelly_cre_v1", type: "USES_MODEL", metadata: { use: "context" } },
  { id: "rel_010", sourceId: "assignment_cre_000184", targetId: "worker_b2a2", type: "EXECUTED_BY", metadata: {} },
  { id: "rel_011", sourceId: "worker_b2a2", targetId: "node_swarmrails_dual_6000", type: "REGISTERED_AS", metadata: {} },
  { id: "rel_012", sourceId: "node_swarmrails_dual_6000", targetId: "gpu_6000_0", type: "POWERED_BY", metadata: {} },
  { id: "rel_013", sourceId: "node_swarmrails_dual_6000", targetId: "gpu_6000_1", type: "POWERED_BY", metadata: {} },
  { id: "rel_014", sourceId: "assignment_cre_000184", targetId: "rulebook_cre_ic_v1", type: "JUDGED_BY", metadata: {} },
  { id: "rel_015", sourceId: "rulebook_cre_ic_v1", targetId: "verdict_honey", type: "PRODUCED", metadata: {} },
  { id: "rel_016", sourceId: "verdict_honey", targetId: "receipt_9f2c", type: "HASHED_TO", metadata: {} },
  { id: "rel_017", sourceId: "assignment_cre_000184", targetId: "artifact_final_ic_memo", type: "PRODUCED", metadata: {} },
  { id: "rel_018", sourceId: "artifact_final_ic_memo", targetId: "receipt_9f2c", type: "VERIFIED_BY", metadata: {} },
  { id: "rel_019", sourceId: "receipt_9f2c", targetId: "deed_0001", type: "DEEDED_AS", metadata: {} },
  { id: "rel_020", sourceId: "appraisal_aiov_0001", targetId: "deed_0001", type: "DEEDED_AS", metadata: {} },
  { id: "rel_021", sourceId: "op_microscaler", targetId: "node_swarmrails_dual_6000", type: "BELONGS_TO", metadata: {} },
  { id: "rel_022", sourceId: "defendableworker", targetId: "worker_b2a2", type: "REGISTERED_AS", metadata: {} },
  { id: "rel_023", sourceId: "model_swarmcurator_9b", targetId: "dataset_royal_jelly_cre_v1", type: "VERIFIED_BY", metadata: { mode: "curation" } },
];

export const events: EventSeed[] = [
  { id: "evt_001", eventType: "assignment.created", actorId: "client_demo", subjectId: "assignment_cre_000184", status: "verified", metadata: { lane: "CRE" }, createdAt: "2026-05-28T18:00:00Z" },
  { id: "evt_002", eventType: "router.job_routed", actorId: "defendablerouter", subjectId: "assignment_cre_000184", receiptHash: "sha256:quote-demo-184", status: "verified", metadata: { gpu_sku: "rtx6000_blackwell_96gb" }, createdAt: "2026-05-28T18:01:00Z" },
  { id: "evt_003", eventType: "worker.registered", actorId: "defendableworker", subjectId: "worker_b2a2", status: "verified", metadata: { heartbeat_seconds: 30 }, createdAt: "2026-05-28T18:02:00Z" },
  { id: "evt_004", eventType: "model.invoked", actorId: "agent_hermes", subjectId: "model_atlas_cre_27b", status: "running", metadata: { tokens: 184000 }, createdAt: "2026-05-28T18:03:00Z" },
  { id: "evt_005", eventType: "dataset.attached", actorId: "defendablecloud", subjectId: "dataset_royal_jelly_cre_v1", status: "verified", metadata: { checksum: "sha256:royal-jelly-cre-demo" }, createdAt: "2026-05-28T18:04:00Z" },
  { id: "evt_006", eventType: "rulebook.evaluated", actorId: "rulebook_cre_ic_v1", subjectId: "assignment_cre_000184", status: "verified", metadata: { passed: 11, review_required: 1 }, createdAt: "2026-05-28T18:08:00Z" },
  { id: "evt_007", eventType: "verdict.issued", actorId: "rulebook_cre_ic_v1", subjectId: "verdict_honey", status: "verified", metadata: { verdict: "HONEY" }, createdAt: "2026-05-28T18:10:00Z" },
  { id: "evt_008", eventType: "receipt.created", actorId: "defendablerouter", subjectId: "receipt_9f2c", receiptHash: "sha256:9f2c-demo-proof-receipt", status: "verified", metadata: { canonical_json: true }, createdAt: "2026-05-28T18:11:00Z" },
  { id: "evt_009", eventType: "artifact.finalized", actorId: "agent_hermes", subjectId: "artifact_final_ic_memo", receiptHash: "sha256:artifact-final-ic-memo", status: "verified", metadata: { format: "pdf" }, createdAt: "2026-05-28T18:12:00Z" },
  { id: "evt_010", eventType: "deed.anchored", actorId: "org_swarm_bee", subjectId: "deed_0001", receiptHash: "sha256:9f2c-demo-proof-receipt", status: "verified", metadata: { anchor: "demo" }, createdAt: "2026-05-28T18:14:00Z" },
];

export const artifacts = [
  { id: "artifact_final_ic_memo", type: "report", name: "Final CRE Investment Committee Memo", uri: "s3://defendable-artifacts/demo/cre_000184/final_ic_memo.pdf", sha256: "sha256:artifact-final-ic-memo", metadata: { pages: 18, status: "approved" } },
];

export const proofTraces = [
  {
    id: "cre_2026_000184",
    assignmentId: "assignment_cre_000184",
    clientId: "client_demo",
    modelId: "model_atlas_cre_27b",
    workerId: "worker_b2a2",
    computeNodeId: "node_swarmrails_dual_6000",
    datasetIds: ["dataset_royal_jelly_cre_v1"],
    rulebookId: "rulebook_cre_ic_v1",
    verdictId: "verdict_honey",
    receiptHash: "sha256:9f2c-demo-proof-receipt",
    artifactId: "artifact_final_ic_memo",
    metadata: { hardware: "2x RTX PRO 6000 Blackwell 96GB", runtime: "Hermes Runtime", proof_status: "verified" },
  },
];
