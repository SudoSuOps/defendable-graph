# DefendableGraph

DefendableGraph is the living proof graph for agentic work.

It connects agents, models, workers, compute nodes, datasets, assignments, rulebooks, verdicts, receipts, deeds, clients, and artifacts into one verifiable system of record.

## What It Shows

A Defendable action is not just an output. It is a relationship chain:

```text
Client -> Assignment -> Agent/Model -> Dataset -> Worker -> Compute Node -> Rulebook -> Verdict -> Receipt -> Final Artifact
```

DefendableGraph makes that chain visible, searchable, inspectable, and API-addressable.

## Datasets

The dataset library is wired live from DefendableCloud's `/datasets/catalog`
endpoint. Visit:

- `/datasets` — the full library (99 packages · 12 verticals · 3.35M training
  pairs) with vertical filter chips and search.
- `/share/dataset/<slug>` — public share link for any single dataset card.
  Anyone with the URL sees the card and can initiate a download · the
  download itself mints a per-org receipt on the chain (books-and-records
  by design).

Public share viewers don't need member auth. The graph's server-side route
handlers (`/api/share/dataset/<slug>`, `/api/share/dataset/<slug>/download`)
proxy through the configured API key.

A daily GitHub Actions workflow (`.github/workflows/datasets-snapshot.yml`)
pulls the catalog, validates the books-and-records shape, and uploads the
JSON as a 90-day-retention artifact. Set the `DEFENDABLE_CLOUD_API_KEY` repo
secret to enable.

## Live Chain Mode

The graph dashboards (`/graph`, `/events`) optionally feed from a live
DefendableCloud org chain. When the following env vars are set, the seed
data is hidden and the live chain takes over:

```
DEFENDABLE_CLOUD_API_BASE   default https://api.defendablecloud.com
DEFENDABLE_CLOUD_API_KEY    member API key (dc_...) for that org
```

To mint a key:

1. Sign in at https://app.defendablecloud.com/org
2. Create an API key (any label) → copy the `dc_...` secret on screen
3. Set it on the graph's Cloudflare Pages env:
   ```bash
   wrangler pages secret put DEFENDABLE_CLOUD_API_KEY --project-name=defendable-graph
   ```
4. Redeploy → `/graph` now shows the live receipt chain (model pins, cooks,
   evals, dataset downloads, incidents) layered onto the always-on infra
   backbone (org, operators, agents, GPUs).

When the key is unset OR the chain is empty, the page falls back to seed
data so the demo never goes blank.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- React Flow via `@xyflow/react`
- Framer Motion
- Prisma
- SQLite for local dev, Postgres-ready schema direction

## Local Setup

```bash
npm install
cp .env.example .env
npm run db:push
npm run db:seed
npm run dev
```

Open:

- Home: http://localhost:3000
- Graph dashboard: http://localhost:3000/graph
- Proof trace: http://localhost:3000/proof/cre_2026_000184
- Events: http://localhost:3000/events

## Scripts

```bash
npm run dev
npm run build
npm run lint
npm run db:push
npm run db:seed
```

## API

```bash
GET  /api/graph
POST /api/graph/entities
POST /api/graph/relationships
GET  /api/proof/cre_2026_000184
GET  /api/events
POST /api/events
```

## Seeded Proof Trace

Default proof ID:

```text
cre_2026_000184
```

Includes:

- Swarm & Bee Demo Client
- CRE Assignment 000184
- DefendableRouter
- Hermes Runtime
- Atlas CRE 27B
- Royal Jelly CRE v1
- worker_b2a2ecf54100456aac77d6b03847cc8e
- node_swarmrails_dual_6000
- 2x RTX PRO 6000 Blackwell 96GB
- CRE IC Memo Rulebook v1
- Tribunal Verdict: HONEY
- sha256:9f2c-demo-proof-receipt
- Final CRE Investment Committee Memo

## Cloudflare Pages Notes

For a standard Next.js deployment, connect this repo to Cloudflare Pages and use the Cloudflare Next.js adapter path preferred by the Pages project. If deploying as a Node-backed Next app elsewhere, `npm run build && npm run start` is sufficient.

## Product Direction

DefendableGraph is the relationship layer for trusted AI execution. DefendableOS explains proof of execution. DefendableCloud provides member datasets and private compute. DefendableRouter controls jobs and receipts. DefendableGraph shows how those pieces connect.

## Cloudflare Pages Deployment

Use the Cloudflare-compatible Next.js build output, not raw `.next`.

Cloudflare Pages settings:

```text
Framework preset: Next.js
Build command: npm run pages:build
Build output directory: .vercel/output/static
Root directory: /
```

The raw `.next` directory contains build cache files that exceed Cloudflare Pages' 25 MiB asset limit. The `pages:build` script uses `@cloudflare/next-on-pages` to produce the Pages-compatible `.vercel/output/static` directory and worker assets.
