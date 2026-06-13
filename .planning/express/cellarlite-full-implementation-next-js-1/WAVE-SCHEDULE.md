wave: 1
domain: database
depends_on: []
features: [F6]
objective: "Create scripts/migrate.mjs (idempotent DDL), lib/db.ts (pg.Pool singleton), wire npm scripts — the foundation every API and UI layer depends on."
estimated_plans: 1
---
wave: 2
domain: backend
depends_on: [1]
features: [F5]
objective: "Implement all six REST API endpoints: GET/POST /api/bottles, GET/PUT/DELETE /api/bottles/[id], GET /api/health — with full TypeScript interfaces, server-side validation, and correct HTTP status codes."
estimated_plans: 2
---
wave: 3
domain: frontend
depends_on: [2]
features: [F0, F1, F2, F3, F4, F7]
objective: "Build all Next.js App Router pages (list, add, edit/delete) with search/filter, TechSur brand palette, mobile-first CSS, iframe-safe headers, and accessible form labels."
estimated_plans: 3
---
wave: 4
domain: integration
depends_on: [1, 2, 3]
features: [F0, F1, F2, F3, F4, F5, F6, F7]
objective: "End-to-end verification: full CRUD flows, search persistence, migration idempotency, iframe header check, mobile layout at 375 px, and K8s liveness probe validation."
estimated_plans: 1
