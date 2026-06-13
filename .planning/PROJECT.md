# CellarLite

## What This Is

CellarLite is a personal, single-user, mobile-first wine-cellar web application. It answers the question "What bottles do I have, where are they, and how many?" — letting the user add, edit, and remove wine bottles from their collection. MVP only; no authentication, no multi-tenancy, no AI features.

## Core Value

A user can instantly see their entire wine collection and make changes to it — add, edit, or remove a bottle — from any device, with data persisted reliably in PostgreSQL.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] View full bottle list on `/` with name, vintage, varietal, quantity, location
- [ ] Empty-state message ("No bottles yet") and "Add bottle" button when cellar is empty
- [ ] Add a bottle via `/bottles/new` form (name required; vintage, varietal, quantity, location optional)
- [ ] Edit a bottle via `/bottles/[id]/edit` form
- [ ] Delete a bottle from the edit page with confirmation
- [ ] Search/filter by name via query string `?q=` on the list page
- [ ] Data persisted in PostgreSQL; survives page reload
- [ ] `GET /api/health` returns `200 {"status":"ok"}`
- [ ] Full REST API: GET/POST /api/bottles, GET/PUT/DELETE /api/bottles/[id]
- [ ] Auto-migration of `bottles` table on server start (idempotent `CREATE TABLE IF NOT EXISTS`)

### Out of Scope

- Authentication / multi-user — MVP is single-user, no login
- Image uploads — MVP scope
- Ratings / tasting notes — MVP scope
- Import / export — MVP scope
- Pagination — small collection assumption, MVP scope
- AI recommendations — explicitly excluded
- Docker / docker-compose — platform provides Postgres natively; no container orchestration in app

## Context

- **Platform:** Pivota K8s sandbox. PostgreSQL 16 runs as a co-resident container on `localhost:5432`, credentials injected via environment variables. The app must connect to it natively — no Docker, no ORM required.
- **Environment variables:** `DATABASE_URL=postgres://postgres:devpass@localhost:5432/app`, plus individual `POSTGRES_*` vars. Use `DATABASE_URL` as the single source of truth.
- **Port:** Must bind to `0.0.0.0:3000` (sandbox proxy).
- **Stack:** Next.js 14 (App Router) + `pg` (node-postgres), plain CSS or CSS Modules. Config must be `next.config.mjs` (never `.ts`).
- **UI brand:** TechSur accent — Gold `#FBCA5C` (≤10% per view) on near-black `#0A0A0A` text, white surfaces. Mobile-first.
- **No frame-blocking headers:** The app renders in an iframe preview; `X-Frame-Options: DENY` or `frame-ancestors 'none'` must not be emitted.

## Constraints

- **Stack**: Next.js 14 + pg — no ORM required, raw SQL preferred for simplicity
- **Config file**: Must be `next.config.mjs` or `.js` — Next 14 cannot parse `.ts` config
- **Database**: Use `DATABASE_URL` env var; never hard-code credentials
- **No Docker**: No `Dockerfile`, no `docker-compose.yml`, no `compose.yaml`
- **Migrations**: Auto-run before server starts via npm scripts (`dev` and `start` both run `npm run migrate` first)
- **Port**: Bind to `0.0.0.0:3000`
- **Headers**: No `X-Frame-Options: DENY` or CSP `frame-ancestors` that blocks iframes
- **Single table**: `bottles` only — no additional entities in MVP

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Next.js 14 App Router | Prescribed by platform constraints | — Pending |
| Raw SQL via `pg` | Keeps stack minimal; no ORM complexity | — Pending |
| `next.config.mjs` | Next 14 cannot read `.ts` config; hard-errors | — Pending |
| Auto-migration on start | Zero manual DB setup — runs on every `dev`/`start` | — Pending |
| No authentication | MVP scope; single personal user | — Pending |
| No Docker/compose | Platform owns Postgres; native `npm` startup only | — Pending |

---
*Last updated: 2026-06-13 after initialization*
