// Project DefendableCloud receipts onto the graph's entity/relationship model.
//
// Each receipt becomes one "receipt" node plus a small fan of related nodes
// (model, dataset, assignment) derived from the schema-aware summary. Edges
// connect them. The seed-data infra (org / operators / GPUs / agents) stays
// the always-on backbone — we layer live receipts on top.

import type { ReceiptRollup } from "./cloud";
import type { EntitySeed, EventSeed, RelationshipSeed } from "./seed-data";

/** Stable id for the receipt node itself. */
const receiptNodeId = (r: ReceiptRollup) => `receipt_${r.receipt_id}`;
/** Stable id for an in-summary entity (so multiple receipts share the same model node). */
const modelNodeId = (slug: string) => `model_live_${slug}`;
const datasetNodeId = (slug: string) => `dataset_live_${slug}`;
const assignmentNodeId = (rid: string) => `assignment_live_${rid}`;
const verdictNodeId = (rid: string) => `verdict_live_${rid}`;
const deedNodeId = (rid: string) => `deed_live_${rid}`;

/** Short SHA prefix used in node names · keeps tiles readable. */
const shortSha = (s: string | undefined | null, n = 8) =>
  typeof s === "string" && s ? s.slice(0, n) : "";

const SCHEMA_LABEL: Record<string, string> = {
  "defendablecloud.eval-receipt/v1": "eval",
  "defendablecloud.cook-receipt/v1": "cook",
  "defendablecloud.incident-receipt/v1": "incident",
  "defendablecloud.dataset-download-receipt/v1": "download",
  "defendablecloud.model-pin-receipt/v1": "model-pin",
};

/**
 * Project a rollup list onto graph nodes + edges + events.
 *
 * Returns *new* arrays only · the caller is responsible for merging with the
 * seed-infra backbone. We dedupe nodes by id since multiple receipts can
 * reference the same model/dataset.
 */
export function projectChain(rollups: ReceiptRollup[]): {
  nodes: EntitySeed[];
  edges: RelationshipSeed[];
  events: EventSeed[];
} {
  const nodes = new Map<string, EntitySeed>();
  const edges = new Map<string, RelationshipSeed>();
  const events: EventSeed[] = [];

  // The org is the anchor that every receipt edges back to. We render the
  // live org as a single composite node (live receipts came from one chain).
  const liveOrgId = "live_org_root";
  nodes.set(liveOrgId, {
    id: liveOrgId,
    type: "organization",
    name: "Your chain",
    status: "verified",
    description: "Live chain · all receipts below mint here.",
    metadata: { source: "GET /receipts/recent", limit: rollups.length },
  });

  for (const r of rollups) {
    const summary = (r.summary || {}) as Record<string, unknown>;
    const lane = String(summary.lane || "");
    const laneLabel = SCHEMA_LABEL[r.payload_schema] || lane || "receipt";

    // ── The receipt node itself ───────────────────────────────────────────
    const recId = receiptNodeId(r);
    nodes.set(recId, {
      id: recId,
      type: "receipt",
      name: `${laneLabel} · ${shortSha(r.receipt_sha256, 8)}`,
      status: "verified",
      description: `${laneLabel} receipt · org_seq ${r.org_seq}`,
      metadata: {
        receipt_id: r.receipt_id,
        org_seq: r.org_seq,
        schema: r.payload_schema,
        receipt_sha256: r.receipt_sha256,
        share_url: r.share_url,
        created_at: r.created_at,
        // share_token lets the UI click through to the Inspector without
        // re-parsing the URL · saved verbatim from the cloud API.
        share_token: extractShareTokenFromUrl(r.share_url),
        ...summary,
      },
    });
    edges.set(`${liveOrgId}->${recId}`, {
      id: `edge_${liveOrgId}_${recId}`,
      sourceId: liveOrgId,
      targetId: recId,
      type: "minted",
      metadata: { lane: laneLabel },
    });

    // ── Schema-specific neighbours ────────────────────────────────────────
    if (lane === "model-pin") {
      const slug = String(summary.model_slug || "");
      if (slug) {
        const mid = modelNodeId(slug);
        if (!nodes.has(mid)) {
          nodes.set(mid, {
            id: mid,
            type: "model",
            name: String(summary.model_name || slug),
            status: "verified",
            description: `Pinned in-house model · ${slug}`,
            metadata: {
              slug,
              base: summary.base,
              params_b: summary.params_b,
              source: "model-pin-receipt/v1",
            },
          });
        }
        edges.set(`${recId}->${mid}`, {
          id: `edge_pin_${r.receipt_id}_${slug}`,
          sourceId: recId,
          targetId: mid,
          type: "pinned",
          metadata: { declaration: summary.declaration, client_ref: summary.client_ref },
        });
      }
    }

    if (lane === "cook") {
      const rid = String(summary.run_title || r.receipt_id);
      const assignId = assignmentNodeId(r.receipt_id);
      nodes.set(assignId, {
        id: assignId,
        type: "assignment",
        name: rid,
        status: "verified",
        description: `Fine-tune cook · proved before→after`,
        metadata: {
          base_model: summary.base_model,
          eval_before: summary.eval_before,
          eval_after: summary.eval_after,
          lift: summary.lift,
        },
      });
      edges.set(`${assignId}->${recId}`, {
        id: `edge_cook_${r.receipt_id}`,
        sourceId: assignId,
        targetId: recId,
        type: "produced",
        metadata: { lift: summary.lift },
      });

      // base_model edge · also shows up as a node if we don't have it yet
      const base = String(summary.base_model || "");
      if (base) {
        const mid = modelNodeId(base);
        if (!nodes.has(mid)) {
          nodes.set(mid, {
            id: mid,
            type: "model",
            name: base,
            status: "active",
            description: `Base model used by cook`,
            metadata: { slug: base, source: "cook-receipt/v1.base_model" },
          });
        }
        edges.set(`${assignId}->${mid}`, {
          id: `edge_cook_base_${r.receipt_id}`,
          sourceId: assignId,
          targetId: mid,
          type: "trained_from",
          metadata: {},
        });
      }

      // Cross-link · cook → pin (Sprint 12 cook/pin join surfaces here)
      const pinSlug = String(summary.pinned_model_slug || "");
      if (pinSlug) {
        const mid = modelNodeId(pinSlug);
        if (!nodes.has(mid)) {
          nodes.set(mid, {
            id: mid,
            type: "model",
            name: pinSlug,
            status: "verified",
            description: `Declared via prior pin`,
            metadata: { slug: pinSlug, source: "cook-receipt/v1.pinned_model" },
          });
        }
        edges.set(`${recId}->${mid}`, {
          id: `edge_pin_link_${r.receipt_id}`,
          sourceId: recId,
          targetId: mid,
          type: "declared_via_pin",
          metadata: {},
        });
      }
    }

    if (lane === "eval") {
      const rid = String(summary.run_title || r.receipt_id);
      const assignId = assignmentNodeId(r.receipt_id);
      const verId = verdictNodeId(r.receipt_id);
      nodes.set(assignId, {
        id: assignId,
        type: "assignment",
        name: rid,
        status: "verified",
        description: `Run · eval-verdict-receipt`,
        metadata: {},
      });
      nodes.set(verId, {
        id: verId,
        type: "verdict",
        name: `${summary.outcome ?? "—"} · ${summary.severity ?? "—"}`,
        status: String(summary.outcome ?? "verified") === "pass" ? "verified" : "warning",
        description: `Outcome ${summary.outcome ?? "—"}`,
        metadata: {
          outcome: summary.outcome,
          severity: summary.severity,
          score_100: summary.score_100,
        },
      });
      edges.set(`${assignId}->${verId}`, {
        id: `edge_assign_verdict_${r.receipt_id}`,
        sourceId: assignId,
        targetId: verId,
        type: "produced",
        metadata: {},
      });
      edges.set(`${verId}->${recId}`, {
        id: `edge_verdict_receipt_${r.receipt_id}`,
        sourceId: verId,
        targetId: recId,
        type: "sealed_into",
        metadata: {},
      });
    }

    if (lane === "dataset-download") {
      const slug = String(summary.package_slug || "");
      const did = deedNodeId(r.receipt_id);
      nodes.set(did, {
        id: did,
        type: "deed",
        name: `download · ${shortSha(r.receipt_sha256)}`,
        status: "verified",
        description: `Dataset download grant`,
        metadata: { package_slug: slug, ready_at_grant: summary.ready_at_grant },
      });
      if (slug) {
        const sid = datasetNodeId(slug);
        if (!nodes.has(sid)) {
          nodes.set(sid, {
            id: sid,
            type: "dataset",
            name: String(summary.package_name || slug),
            status: "verified",
            description: `Dataset package · ${summary.vertical ?? "—"}`,
            metadata: { slug, vertical: summary.vertical, source: "dataset-download-receipt/v1" },
          });
        }
        edges.set(`${sid}->${did}`, {
          id: `edge_dataset_deed_${r.receipt_id}`,
          sourceId: sid,
          targetId: did,
          type: "granted_via",
          metadata: {},
        });
      }
      edges.set(`${did}->${recId}`, {
        id: `edge_deed_receipt_${r.receipt_id}`,
        sourceId: did,
        targetId: recId,
        type: "anchored_to",
        metadata: {},
      });
    }

    if (lane === "incident") {
      // Incidents are first-class as receipts; no separate entity for v1.
      // The receipt node already carries kind/severity/status from the
      // summary, which the Inspector surfaces.
    }

    // ── Event row · one per receipt for the /events feed ─────────────────
    events.push({
      id: `evt_${r.receipt_id}`,
      eventType: `${laneLabel}.minted`,
      actorId: liveOrgId,
      subjectId: recId,
      receiptHash: r.receipt_sha256,
      status: "verified",
      metadata: { schema: r.payload_schema, share_url: r.share_url, ...summary },
      createdAt: r.created_at || new Date().toISOString(),
    });
  }

  return {
    nodes: Array.from(nodes.values()),
    edges: Array.from(edges.values()),
    events,
  };
}

/** Pull the share token out of a fully-qualified API share URL. */
function extractShareTokenFromUrl(url: string): string | null {
  if (!url) return null;
  const m = url.match(/\/share\/([A-Za-z0-9_-]+)/);
  return m ? m[1] : null;
}
