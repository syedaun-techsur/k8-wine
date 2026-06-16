// app/api/bottles/route.ts
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import type { Bottle, CreateBottleRequest } from '@/types/bottle';

// ─── GET /api/bottles ─────────────────────────────────────────────────────────
// Returns all bottles newest-first. Optional ?q= performs ILIKE name filter.
// SQL (no filter): SELECT * FROM bottles ORDER BY created_at DESC
// SQL (filter):    SELECT * FROM bottles WHERE name ILIKE $1 ORDER BY created_at DESC
//                 $1 = '%' + q.trim() + '%'  (max 500 chars, parameterised — never interpolated)
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const rawQ = searchParams.get('q') ?? '';
    const q = rawQ.trim().slice(0, 500); // cap at 500 chars per FRD F04-REQ-08

    let result;
    if (q.length > 0) {
      // Parameterised ILIKE — never string interpolation (FRD security requirement)
      result = await pool.query<Bottle>(
        'SELECT * FROM bottles WHERE name ILIKE $1 ORDER BY created_at DESC',
        [`%${q}%`]
      );
    } else {
      result = await pool.query<Bottle>(
        'SELECT * FROM bottles ORDER BY created_at DESC'
      );
    }

    return NextResponse.json(result.rows, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ─── POST /api/bottles ────────────────────────────────────────────────────────
// Creates a new bottle. Validates all fields server-side before any SQL.
// On success: 201 with created Bottle object.
// Error codes: 400 (bad JSON), 422 (validation), 500 (DB failure)
export async function POST(request: NextRequest): Promise<NextResponse> {
  // JSON parse guard — malformed body → 400
  let body: CreateBottleRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // ── Validation (from FRD F05, TechArch §4 Validation Rules Summary) ─────────
  const { name, vintage, varietal, quantity, location } = body;

  // name: required, non-empty string after trim, max 255
  if (typeof name !== 'string' || name.trim().length === 0) {
    return NextResponse.json({ error: 'Name is required' }, { status: 422 });
  }
  if (name.trim().length > 255) {
    return NextResponse.json(
      { error: 'Name must be 255 characters or fewer' },
      { status: 422 }
    );
  }

  // vintage: optional; if provided must be integer in [1800, currentYear+1]
  if (vintage !== undefined && vintage !== null) {
    if (!Number.isInteger(vintage)) {
      return NextResponse.json(
        { error: 'Vintage must be a valid year' },
        { status: 422 }
      );
    }
    const maxYear = new Date().getFullYear() + 1;
    if (vintage < 1800 || vintage > maxYear) {
      return NextResponse.json(
        { error: `Vintage must be between 1800 and ${maxYear}` },
        { status: 422 }
      );
    }
  }

  // varietal: optional; max 255 chars
  if (varietal !== undefined && varietal !== null) {
    if (typeof varietal !== 'string' || varietal.length > 255) {
      return NextResponse.json(
        { error: 'Varietal must be 255 characters or fewer' },
        { status: 422 }
      );
    }
  }

  // quantity (POST): optional; if provided must be integer >= 1; defaults to 1
  // POST requires >= 1 (not 0 — that is only allowed on PUT per FRD F02 note)
  const resolvedQty = quantity ?? 1;
  if (!Number.isInteger(resolvedQty)) {
    return NextResponse.json(
      { error: 'Quantity must be a whole number' },
      { status: 422 }
    );
  }
  if (resolvedQty < 1) {
    return NextResponse.json(
      { error: 'Quantity must be at least 1' },
      { status: 422 }
    );
  }

  // location: optional; max 500 chars
  if (location !== undefined && location !== null) {
    if (typeof location !== 'string' || location.length > 500) {
      return NextResponse.json(
        { error: 'Location must be 500 characters or fewer' },
        { status: 422 }
      );
    }
  }

  // ── Insert ───────────────────────────────────────────────────────────────────
  // SQL from TechArch §3 Query Patterns "Insert new bottle" — copy verbatim:
  // INSERT INTO bottles (name, vintage, varietal, quantity, location)
  // VALUES ($1, $2, $3, $4, $5)
  // RETURNING *;
  // $1=name, $2=vintage|null, $3=varietal|null, $4=quantity(default 1), $5=location|null
  try {
    const result = await pool.query<Bottle>(
      `INSERT INTO bottles (name, vintage, varietal, quantity, location)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        name.trim(),
        vintage ?? null,
        (varietal?.trim() || null) ?? null,
        resolvedQty,
        (location?.trim() || null) ?? null,
      ]
    );
    return NextResponse.json(result.rows[0], { status: 201 });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
