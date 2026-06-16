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
