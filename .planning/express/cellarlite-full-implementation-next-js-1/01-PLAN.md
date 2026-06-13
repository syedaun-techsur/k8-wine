---
phase: cellarlite-full-implementation-next-js-1
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - package.json
  - scripts/migrate.mjs
  - lib/db.ts
  - next.config.mjs
  - tsconfig.json
autonomous: true

features:
  implements: ["F6"]
  depends_on: []
  enables: ["F5", "F0", "F1", "F2", "F3", "F4", "F7"]

must_haves:
  truths:
    - "Running `node scripts/migrate.mjs` (with DATABASE_URL set) exits 0 and prints 'Migration complete.'"
    - "Running `node scripts/migrate.mjs` twice in a row both exit 0 — idempotent"
    - "Running `node scripts/migrate.mjs` with DATABASE_URL unset exits 1 and prints error to stderr"
    - "`lib/db.ts` exports a default pg.Pool singleton using DATABASE_URL"
    - "`npm run migrate` script is `node scripts/migrate.mjs`"
    - "`npm run dev` is `npm run migrate && next dev -p 3000`"
    - "`npm run start` is `npm run migrate && next start -p 3000`"
    - "`next.config.mjs` sets X-Frame-Options: SAMEORIGIN (never DENY)"
  artifacts:
    - path: "scripts/migrate.mjs"
      provides: "Idempotent CREATE TABLE IF NOT EXISTS DDL runner"
      contains: "CREATE TABLE IF NOT EXISTS bottles"
    - path: "lib/db.ts"
      provides: "pg.Pool singleton"
      exports: ["default pool"]
    - path: "package.json"
      provides: "npm scripts: migrate, dev, start, build"
      contains: "npm run migrate && next"
    - path: "next.config.mjs"
      provides: "iframe-safe headers, ESM config"
      contains: "SAMEORIGIN"
  key_links:
    - from: "scripts/migrate.mjs"
      to: "PostgreSQL bottles table"
      via: "pg.Client + DATABASE_URL"
      pattern: "new Client.*DATABASE_URL"
    - from: "lib/db.ts"
      to: "PostgreSQL"
      via: "pg.Pool + DATABASE_URL"
      pattern: "new Pool.*DATABASE_URL"
    - from: "package.json dev/start scripts"
      to: "scripts/migrate.mjs"
      via: "npm run migrate &&"
      pattern: "npm run migrate && next"

integration_contracts:
  requires: []
  provides:
    - artifact: "lib/db.ts"
      exports: ["default (pg.Pool)"]
      shape: |
        import { Pool } from 'pg';
        const pool = new Pool({ connectionString: process.env.DATABASE_URL });
        export default pool;
      verify: "grep -n 'export default pool' lib/db.ts && echo CONTRACT_OK"
    - artifact: "scripts/migrate.mjs"
      exports: ["idempotent migration — exits 0"]
      shape: "node scripts/migrate.mjs (ESM, pg.Client, CREATE TABLE IF NOT EXISTS bottles)"
      verify: "grep -n 'CREATE TABLE IF NOT EXISTS bottles' scripts/migrate.mjs && echo CONTRACT_OK"
    - artifact: "package.json (scripts)"
      exports: ["migrate", "dev", "start", "build"]
      shape: |
        "migrate": "node scripts/migrate.mjs"
        "dev":     "npm run migrate && next dev -p 3000"
        "start":   "npm run migrate && next start -p 3000"
        "build":   "next build"
      verify: "node -e \"const p=require('./package.json');console.log(p.scripts.migrate,p.scripts.dev,p.scripts.start)\" | grep -q 'migrate' && echo CONTRACT_OK"
    - artifact: "next.config.mjs"
      exports: ["headers() — X-Frame-Options: SAMEORIGIN"]
      shape: "ESM default export with async headers() returning SAMEORIGIN"
      verify: "grep -n 'SAMEORIGIN' next.config.mjs && echo CONTRACT_OK"
---

<objective>
Bootstrap the CellarLite project — create the project scaffold, database migration script, pg.Pool singleton, Next.js ESM config, and npm scripts that every subsequent wave depends on.

Purpose: Wave 1 is the mandatory foundation. Without a working `scripts/migrate.mjs` and `lib/db.ts`, the API (wave 2) and UI (wave 3) cannot function. Migration auto-runs before the server boots so no manual DB setup is ever required.

Output:
- `scripts/migrate.mjs` — idempotent CREATE TABLE IF NOT EXISTS; exits 0/1
- `lib/db.ts` — pg.Pool singleton from DATABASE_URL
- `next.config.mjs` — X-Frame-Options: SAMEORIGIN, ESM format
- `package.json` — correct npm scripts (migrate, dev, start, build)
- `tsconfig.json` — TypeScript config for app code
</objective>

<feature_dependencies>
Implements: F6: Database Auto-Migration (scripts/migrate.mjs, lib/db.ts, bottles DDL, npm scripts)
Depends on: None
Enables: F5: REST API, F0: Bottle List Page, F1: Add Bottle, F2: Edit Bottle, F3: Delete Bottle, F4: Search/Filter, F7: Brand UI
</feature_dependencies>

<execution_context>
@.planning/express/cellarlite-full-implementation-next-js-1/WAVE-SCHEDULE.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/STATE.md
</context>

<tasks>

<task type="auto">
  <name>Task 1: Project scaffold — package.json, tsconfig.json, next.config.mjs</name>
  <files>
    package.json
    tsconfig.json
    next.config.mjs
  </files>
  <action>
Create or update the three configuration files that define the project. The workspace root is `/app/workspaces/kubernetes-test/k8-wine`.

**1. `package.json`**

Create with the exact scripts and dependencies from TechArch §2 npm Scripts and §6 Key Dependencies. Never omit the `migrate` script; never use `next dev` without `-p 3000`.

```json
{
  "name": "cellarlite",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "migrate": "node scripts/migrate.mjs",
    "dev":     "npm run migrate && next dev -p 3000",
    "start":   "npm run migrate && next start -p 3000",
    "build":   "next build"
  },
  "dependencies": {
    "next":      "^14.2.0",
    "react":     "^18.3.0",
    "react-dom": "^18.3.0",
    "pg":        "^8.12.0"
  },
  "devDependencies": {
    "@types/node":     "^20.0.0",
    "@types/react":    "^18.0.0",
    "@types/react-dom":"^18.0.0",
    "@types/pg":       "^8.6.0",
    "typescript":      "^5.4.0"
  }
}
```

**2. `tsconfig.json`**

Standard Next.js 14 App Router TypeScript config:

```json
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

**3. `next.config.mjs`**

CRITICAL constraints (from TechArch §2 Configuration and §5 Security Architecture):
- File MUST be `.mjs` — Next.js 14 cannot parse `.ts` config
- `X-Frame-Options` MUST be `SAMEORIGIN` (never `DENY`) — app renders inside K8s sandbox iframe
- NO `Content-Security-Policy` with `frame-ancestors 'none'`

```js
// next.config.mjs  — MUST be .mjs, never .ts
/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // SAMEORIGIN allows iframe embedding from same origin (sandbox preview)
          // Never use DENY — app must render inside iframe
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        ],
      },
    ];
  },
};

export default nextConfig;
```

After writing all three files, run `npm install` to install dependencies.
  </action>
  <verify>
```bash
# Verify package.json scripts are correct
node -e "const p=require('./package.json'); console.log('migrate:', p.scripts.migrate); console.log('dev:', p.scripts.dev); console.log('start:', p.scripts.start)" 2>&1

# Verify next.config.mjs contains SAMEORIGIN (never DENY)
grep -n 'SAMEORIGIN' next.config.mjs && echo "HEADER OK"
grep 'DENY' next.config.mjs && echo "ERROR: DENY found — must be SAMEORIGIN" || echo "DENY not present — OK"

# Verify next.config.mjs is ESM (has export default)
grep -n 'export default' next.config.mjs && echo "ESM OK"

# Verify npm install succeeded
ls node_modules/next/package.json node_modules/pg/package.json && echo "DEPS OK"
```
  </verify>
  <done>
- `package.json` has scripts: migrate=`node scripts/migrate.mjs`, dev=`npm run migrate && next dev -p 3000`, start=`npm run migrate && next start -p 3000`, build=`next build`
- `next.config.mjs` sets `X-Frame-Options: SAMEORIGIN` (not DENY), uses `export default` (ESM)
- `tsconfig.json` present with App Router compatible config
- `node_modules/` populated with next, react, react-dom, pg
  </done>
</task>

<task type="auto">
  <name>Task 2: Database foundation — scripts/migrate.mjs and lib/db.ts</name>
  <files>
    scripts/migrate.mjs
    lib/db.ts
  </files>
  <action>
Create the two database files that every API and page route depends on.

**1. `scripts/migrate.mjs`**

ESM module (`.mjs` — no TypeScript, no ts-node dependency). Implements F6 requirements verbatim from TechArch §2 and RTM §4 F6:

- F06-REQ-02: Check `DATABASE_URL`; if absent → stderr + exit(1)
- F06-REQ-03: Connect via `pg.Client`; connection failure → stderr + exit(1)
- F06-REQ-04: Execute EXACT DDL from TechArch §3 (copy verbatim — do NOT abstract)
- F06-REQ-05: DDL failure → stderr `"ERROR: Migration failed: <message>"` + exit(1)
- F06-REQ-06: Success → stdout `"Migration complete."` + exit(0)

EXACT DDL to execute (from TechArch §3 Complete DDL — copy verbatim):

```sql
CREATE TABLE IF NOT EXISTS bottles (
  id         SERIAL        PRIMARY KEY,
  name       TEXT          NOT NULL,
  vintage    INTEGER,
  varietal   TEXT,
  quantity   INTEGER       NOT NULL DEFAULT 1,
  location   TEXT,
  created_at TIMESTAMPTZ   NOT NULL DEFAULT now()
);
```

Full `scripts/migrate.mjs` implementation:

```js
// scripts/migrate.mjs
// ESM migration script — runs before Next.js boots via npm run migrate
// Called by: "dev": "npm run migrate && next dev -p 3000"
//            "start": "npm run migrate && next start -p 3000"

import pg from 'pg';
const { Client } = pg;

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  process.stderr.write('ERROR: DATABASE_URL environment variable is not set\n');
  process.exit(1);
}

const client = new Client({ connectionString: DATABASE_URL });

try {
  await client.connect();
} catch (err) {
  process.stderr.write(`ERROR: Could not connect to database: ${err.message}\n`);
  process.exit(1);
}

try {
  await client.query(`
    CREATE TABLE IF NOT EXISTS bottles (
      id         SERIAL        PRIMARY KEY,
      name       TEXT          NOT NULL,
      vintage    INTEGER,
      varietal   TEXT,
      quantity   INTEGER       NOT NULL DEFAULT 1,
      location   TEXT,
      created_at TIMESTAMPTZ   NOT NULL DEFAULT now()
    )
  `);
} catch (err) {
  process.stderr.write(`ERROR: Migration failed: ${err.message}\n`);
  await client.end();
  process.exit(1);
}

await client.end();
process.stdout.write('Migration complete.\n');
process.exit(0);
```

**2. `lib/db.ts`**

pg.Pool singleton from TechArch §2 Backend Components (copy the exact implementation — do NOT abstract):

```typescript
// lib/db.ts
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default pool;
```

Design notes (from TechArch):
- Module-level singleton avoids opening a new connection per HTTP request
- `Pool` handles connection lifecycle, idle timeouts, and reconnection automatically
- `DATABASE_URL` is the single source of truth — never use individual `POSTGRES_*` vars in app code

After creating both files, create the `scripts/` and `lib/` directories if they don't exist (Write tool handles this).
  </action>
  <verify>
```bash
# Verify scripts/migrate.mjs exists and contains exact DDL
grep -n 'CREATE TABLE IF NOT EXISTS bottles' scripts/migrate.mjs && echo "DDL OK"
grep -n 'id.*SERIAL.*PRIMARY KEY' scripts/migrate.mjs && echo "ID COL OK"
grep -n 'name.*TEXT.*NOT NULL' scripts/migrate.mjs && echo "NAME COL OK"
grep -n 'vintage.*INTEGER' scripts/migrate.mjs && echo "VINTAGE COL OK"
grep -n 'quantity.*INTEGER.*NOT NULL.*DEFAULT 1' scripts/migrate.mjs && echo "QUANTITY COL OK"
grep -n 'created_at.*TIMESTAMPTZ.*NOT NULL.*DEFAULT now' scripts/migrate.mjs && echo "CREATED_AT COL OK"

# Verify migrate.mjs handles missing DATABASE_URL (exit 1)
node scripts/migrate.mjs 2>&1; echo "Exit code: $?"

# Verify lib/db.ts exports a Pool using DATABASE_URL
grep -n 'export default pool' lib/db.ts && echo "POOL EXPORT OK"
grep -n 'DATABASE_URL' lib/db.ts && echo "DATABASE_URL OK"
grep -n "new Pool" lib/db.ts && echo "POOL INIT OK"

# Verify idempotency (run twice) — requires live DB, skip if no DB available
# DATABASE_URL=postgres://postgres:devpass@localhost:5432/app node scripts/migrate.mjs && \
# DATABASE_URL=postgres://postgres:devpass@localhost:5432/app node scripts/migrate.mjs && echo "IDEMPOTENT OK"
```
  </verify>
  <done>
- `scripts/migrate.mjs` exists as ESM module with exact DDL from TechArch §3
- Missing `DATABASE_URL` → exits 1 with error to stderr (verifiable without DB)
- `lib/db.ts` exports default pg.Pool singleton using `process.env.DATABASE_URL`
- Both files contain no hard-coded credentials
- When run against a live PostgreSQL, `node scripts/migrate.mjs` exits 0 and prints "Migration complete."
- Running twice exits 0 both times (idempotent via CREATE TABLE IF NOT EXISTS)
  </done>
</task>

</tasks>

<verification>
After both tasks complete:

```bash
# 1. Config file format check
ls -la next.config.mjs && echo "CONFIG IS .mjs OK"
ls next.config.ts 2>/dev/null && echo "ERROR: .ts config found" || echo "NO .ts CONFIG OK"

# 2. npm scripts correct
node -e "const p=require('./package.json'); const ok = p.scripts.migrate === 'node scripts/migrate.mjs' && p.scripts.dev.includes('npm run migrate && next dev -p 3000') && p.scripts.start.includes('npm run migrate && next start -p 3000'); console.log('SCRIPTS OK:', ok)"

# 3. X-Frame-Options header — SAMEORIGIN not DENY
grep 'SAMEORIGIN' next.config.mjs && echo "FRAME HEADER OK"

# 4. DATABASE_URL guard works
node scripts/migrate.mjs 2>&1 | grep 'DATABASE_URL' && echo "ENV GUARD OK"

# 5. Pool singleton shape
grep -n 'export default pool' lib/db.ts && echo "DB SINGLETON OK"

# 6. Exact DDL columns present
for col in "SERIAL" "TEXT.*NOT NULL" "INTEGER" "TIMESTAMPTZ"; do
  grep -qE "$col" scripts/migrate.mjs && echo "COL $col: OK" || echo "COL $col: MISSING"
done
```
</verification>

<success_criteria>
- `scripts/migrate.mjs` is a valid ESM module containing exact DDL: `CREATE TABLE IF NOT EXISTS bottles (id SERIAL PRIMARY KEY, name TEXT NOT NULL, vintage INTEGER, varietal TEXT, quantity INTEGER NOT NULL DEFAULT 1, location TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT now())`
- `scripts/migrate.mjs` exits 1 (with stderr error) when `DATABASE_URL` is unset
- `scripts/migrate.mjs` exits 0 and prints "Migration complete." on successful migration
- `lib/db.ts` exports a `pg.Pool` singleton using `process.env.DATABASE_URL`
- `package.json` scripts: `migrate` = `node scripts/migrate.mjs`; `dev` = `npm run migrate && next dev -p 3000`; `start` = `npm run migrate && next start -p 3000`; `build` = `next build`
- `next.config.mjs` is `.mjs` format (ESM), sets `X-Frame-Options: SAMEORIGIN` (never DENY), uses `export default`
- No hard-coded credentials anywhere; `DATABASE_URL` is sole connection source
- No `Dockerfile`, `docker-compose.yml`, or `compose.yaml` created
</success_criteria>

<output>
After completion, wave 1 provides:
- `lib/db.ts` — pg.Pool singleton (consumed by all wave 2 API route handlers)
- `scripts/migrate.mjs` — idempotent migration (consumed by npm start/dev scripts)
- `package.json` — npm scripts (consumed by K8s pod startup command)
- `next.config.mjs` — iframe-safe headers + ESM config (consumed by Next.js runtime)

Wave 2 (backend) can proceed: it imports `lib/db.ts` for all database operations and relies on the `bottles` table existing at startup.
</output>
