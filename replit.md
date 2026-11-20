# NP-Hardness Explorer

A static educational website for a university Data Structures and Algorithms final project, teaching complexity through interactive graph experiments.

## Website scope

- Keep the website entirely browser-only: no backend dependency, database, accounts, external API keys, or paid services.
- Mathematical correctness takes priority over optional visual features.
- Reductions content covers only definition, notation, direction, purpose, and general idea; do not add worked examples, proofs, or interactive reduction exercises.

## Run & Operate

- Use the managed `artifacts/np-hardness-explorer: web` workflow for the website.
- `pnpm --filter @workspace/np-hardness-explorer run typecheck` — website typecheck
- `node --test --experimental-strip-types artifacts/np-hardness-explorer/src/lib/graph.test.ts` — graph algorithm tests
- The shared API/database packages below are unused scaffolding, not requirements of this static website.

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

_Populate as you build — short repo map plus pointers to the source-of-truth file for DB schema, API contracts, theme files, etc._

## Architecture decisions

_Populate as you build — non-obvious choices a reader couldn't infer from the code (3-5 bullets)._

## Product

_Describe the high-level user-facing capabilities of this app once they exist._

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

_Populate as you build — sharp edges, "always run X before Y" rules._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
