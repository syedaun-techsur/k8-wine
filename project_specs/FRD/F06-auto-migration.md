---

## F06: Database Auto-Migration

**Priority:** P0 — Critical (app cannot function without table)
**File:** `scripts/migrate.mjs`
**PRD Reference:** F6

---

**Description:** On every server start — both development (`npm run dev`) and production (`npm run start`) — a migration script runs before Next.js boots. It creates the `bottles` table using `CREATE TABLE IF NOT EXISTS`, making the operation idempotent: safe to run repeatedly against an already-initialised database without modifying existing data. If the database connection fails, the script exits with a non-zero code so that the server process aborts with a readable error rather than starting in a broken state.

---

**Terminology:**

- **Idempotent migration:** Running the migration script any number of times against the same database produces the same final schema state with no errors and no data loss.
- **`CREATE TABLE IF NOT EXISTS`:** PostgreSQL DDL that creates the table only if it does not already exist; no-op if the table is present.
- **Exit code 0:** Script success — Next.js proceeds to start.
- **Non-zero exit code:** Script failure — `npm run dev` / `npm run start` aborts, preventing a broken server from starting.

---

**Sub-features:**

- Establish PostgreSQL connection using `DATABASE_URL`
- Execute idempotent DDL
- Log success/failure to stdout/stderr
- Exit with appropriate code
- Chain into `npm run dev` and `npm run start`

---

**Process:**

1. Script is invoked as `node scripts/migrate.mjs` (ESM module).
2. Read `process.env.DATABASE_URL`. If absent or empty → log `"ERROR: DATABASE_URL environment variable is not set"` to stderr and `process.exit(1)`.
3. Create a `pg.Client` (or `pg.Pool`) using `DATABASE_URL`.
4. Attempt to connect. If connection fails → log `"ERROR: Could not connect to database: <error message>"` to stderr and `process.exit(1)`.
5. Execute the DDL (see below).
6. If DDL execution fails → log `"ERROR: Migration failed: <error message>"` to stderr, release connection, and `process.exit(1)`.
7. Log `"Migration complete."` to stdout.
8. Release connection and `process.exit(0)`.

**DDL executed:**

```sql
CREATE TABLE IF NOT EXISTS bottles (
  id         SERIAL PRIMARY KEY,
  name       TEXT NOT NULL,
  vintage    INTEGER,
  varietal   TEXT,
  quantity   INTEGER NOT NULL DEFAULT 1,
  location   TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**`package.json` scripts (required shape):**

```json
{
  "scripts": {
    "migrate": "node scripts/migrate.mjs",
    "dev":     "npm run migrate && next dev",
    "start":   "npm run migrate && next start",
    "build":   "next build"
  }
}
```

- `build` does **not** run migrate (build may occur without a DB connection in CI).
- Both `dev` and `start` chain `migrate` first with `&&` so Next.js only starts if migration succeeds.

---

**Inputs:**

- `DATABASE_URL` (environment variable, **required**): PostgreSQL connection string, e.g. `postgres://postgres:devpass@localhost:5432/app`.

---

**Outputs:**

- Stdout: `"Migration complete."` on success.
- Stderr: Descriptive error message on any failure.
- Exit code `0` on success; non-zero (`1`) on any failure.

---

**Validation Rules:**

- `DATABASE_URL` must be a non-empty string. If absent → exit 1 before attempting connection.
- DDL must use `CREATE TABLE IF NOT EXISTS` (never `CREATE TABLE`) to ensure idempotency.
- Script must not drop, truncate, or alter existing columns — MVP has no destructive migrations.

---

**Error States:**

| Scenario | Exit Code | Log Output |
|----------|-----------|-----------|
| `DATABASE_URL` not set | 1 | `ERROR: DATABASE_URL environment variable is not set` |
| DB connection refused | 1 | `ERROR: Could not connect to database: connect ECONNREFUSED 127.0.0.1:5432` |
| DB auth failure | 1 | `ERROR: Could not connect to database: password authentication failed` |
| DDL execution error | 1 | `ERROR: Migration failed: <pg error message>` |
| Success | 0 | `Migration complete.` |

---

**API Surface (this feature):** None — migration script has no HTTP interface.

**Schema Surface (this feature):** Creates `bottles` table — see `Y0-schema.md` for full DDL.

---
