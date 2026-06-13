---

## Integration Points

This document lists all external system dependencies and integration contracts for CellarLite MVP.

---

### 1. PostgreSQL 16 Database

**Type:** Database (co-resident container)
**Connection:** `localhost:5432` via `DATABASE_URL` env var
**Driver:** `pg` (node-postgres) v8.x

| Attribute | Value |
|-----------|-------|
| Host | `localhost` (same K8s pod) |
| Port | `5432` |
| Database name | `app` (from `DATABASE_URL`) |
| Connection string | `DATABASE_URL` environment variable |
| Connection pool | `pg.Pool` with default settings |
| Max connections | Default pg pool size (10) — sufficient for MVP |

**Contract:**
- The database is assumed to be running and accessible at `localhost:5432` before `migrate.mjs` is called.
- `migrate.mjs` creates the `bottles` table if it does not exist (idempotent).
- The app assumes PostgreSQL 16 features (specifically: `ILIKE`, `TIMESTAMPTZ`, `SERIAL`, `RETURNING`).
- `DATABASE_URL` is the single source of truth; individual `POSTGRES_*` env vars are not used by the application.

**Failure handling:** If PostgreSQL is unreachable, `migrate.mjs` exits non-zero and `npm run start`/`dev` aborts. K8s readiness probes handle container orchestration retry logic.

---

### 2. Next.js 14 Runtime (App Router)

**Type:** Framework / runtime
**Version:** Next.js 14.x

| Attribute | Value |
|-----------|-------|
| Router | App Router (`app/` directory) |
| Config file | `next.config.mjs` (ESM, never `.ts`) |
| Bind address | `0.0.0.0:3000` |
| Server type | Node.js (standalone or default Next.js server) |

**Contract:**
- Config is `next.config.mjs`. Next.js 14 cannot parse `.ts` config files and will hard-error at startup.
- The `headers()` export in `next.config.mjs` overrides default security headers to allow iframe embedding (no `X-Frame-Options: DENY`, no `frame-ancestors 'none'`).
- `npm run build` builds the production bundle; `npm run start` serves it.
- `npm run dev` runs the development server with hot reload.

---

### 3. Kubernetes Sandbox (Pivota K8s)

**Type:** Hosting platform
**Role:** Runs the Next.js app as a container; provides PostgreSQL co-resident on `localhost`.

| Attribute | Value |
|-----------|-------|
| Exposed port | `3000` (app must bind `0.0.0.0:3000`) |
| Liveness probe | `GET /api/health` → expects `200 {"status":"ok"}` |
| Database injection | `DATABASE_URL` (and optionally `POSTGRES_*`) env vars |
| iframe preview | App renders inside sandbox iframe; frame-blocking headers must not be set |

**Contract:**
- The platform handles DNS, TLS termination, and proxy to port 3000 — the app does not manage these.
- No `Dockerfile`, `docker-compose.yml`, or `compose.yaml` are present in the repository. The platform manages container builds.
- K8s readiness/liveness probes call `GET /api/health`. The endpoint must return `200` quickly (< 200 ms) with no DB dependency.

---

### 4. Browser (Client)

**Type:** Web client (Safari Mobile, Chrome Mobile, Desktop browsers)
**Minimum viewport:** 375 px wide (iPhone SE)

**Contract:**
- The app is server-rendered; JavaScript is used for interactive elements only (search input URL sync, form validation, delete confirmation).
- `window.confirm()` is used for delete confirmation — works in all modern browsers; not overridable by the app.
- No service workers, no PWA manifest, no offline support in MVP.

---

### Out-of-Scope Integrations (MVP)

The following are explicitly **not** integrated in MVP:

- External wine APIs (Vivino, Wine-Searcher, etc.)
- Authentication providers (Auth0, Azure AD, etc.)
- Email / SMS notifications
- Cloud storage (image uploads)
- Analytics / telemetry
- CI/CD systems (no pipeline config in this repo)

---
