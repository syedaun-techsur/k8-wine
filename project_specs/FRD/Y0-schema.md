---

## Database Schema

**Technology:** PostgreSQL 16
**Connection:** `DATABASE_URL` environment variable (e.g. `postgres://postgres:devpass@localhost:5432/app`)
**Driver:** `pg` (node-postgres) — raw SQL, no ORM
**Migration:** `scripts/migrate.mjs` — idempotent, runs before server start

---

### Table: `bottles`

This is the **only** table in the MVP data model.

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

**Column Definitions:**

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `SERIAL` | PRIMARY KEY | Auto-incrementing integer PK. Gaps after deletes are accepted (cosmetic only). |
| `name` | `TEXT` | NOT NULL | Wine label / bottle name. Max 255 chars enforced at application layer. |
| `vintage` | `INTEGER` | NULL allowed | Harvest year (e.g. `2018`). `NULL` when not provided. Range `[1800, currentYear+1]` enforced at application layer. |
| `varietal` | `TEXT` | NULL allowed | Grape variety or wine type. `NULL` when not provided. |
| `quantity` | `INTEGER` | NOT NULL, DEFAULT 1 | Number of physical bottles held. `0` is valid (finished). Application layer enforces ≥ 0 on updates, ≥ 1 on inserts. |
| `location` | `TEXT` | NULL allowed | Free-text storage location. `NULL` when not provided. |
| `created_at` | `TIMESTAMPTZ` | NOT NULL, DEFAULT NOW() | Record creation timestamp in UTC. Never updated after insert. |

---

### Query Patterns

**List all bottles (default sort — newest first):**
```sql
SELECT * FROM bottles ORDER BY created_at DESC;
```

**Search by name (case-insensitive partial match):**
```sql
SELECT * FROM bottles WHERE name ILIKE $1 ORDER BY created_at DESC;
-- $1 = '%' + searchTerm + '%'
```

**Fetch single bottle:**
```sql
SELECT * FROM bottles WHERE id = $1;
-- $1 = integer id
```

**Insert new bottle:**
```sql
INSERT INTO bottles (name, vintage, varietal, quantity, location)
VALUES ($1, $2, $3, $4, $5)
RETURNING *;
-- $1=name, $2=vintage|null, $3=varietal|null, $4=quantity, $5=location|null
```

**Update bottle:**
```sql
UPDATE bottles
SET name=$1, vintage=$2, varietal=$3, quantity=$4, location=$5
WHERE id=$6
RETURNING *;
```

**Delete bottle:**
```sql
DELETE FROM bottles WHERE id = $1 RETURNING id;
```

---

### DB Connection Pattern (recommended)

Use a module-level pool to avoid opening a new connection per request:

```ts
// lib/db.ts
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export default pool;
```

Route Handlers call `pool.query(sql, params)` directly. No transactions required for single-table MVP operations.

---

### Constraints & Invariants

- `SERIAL` PK: No application-level ID generation required.
- `quantity` can reach `0` via PUT but never goes negative (enforced at API layer, not DB constraint in MVP).
- `created_at` is set by the DB default; never passed in INSERT bodies.
- No foreign keys, no indexes beyond the implicit PK index (sufficient for MVP collection size).
- No soft-delete — DELETE is permanent.

---
