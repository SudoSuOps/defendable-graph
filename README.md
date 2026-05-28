# DefendableGraph

DefendableGraph is the living proof graph for agentic work.

It connects agents, models, workers, compute nodes, datasets, assignments, rulebooks, verdicts, receipts, deeds, clients, and artifacts into one verifiable system of record.

## What It Shows

A Defendable action is not just an output. It is a relationship chain:

```text
Client -> Assignment -> Agent/Model -> Dataset -> Worker -> Compute Node -> Rulebook -> Verdict -> Receipt -> Final Artifact
```

DefendableGraph makes that chain visible, searchable, inspectable, and API-addressable.

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
