import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// id path param must parse as a positive integer via parseInt(id, 10).
// NaN, 0, or negative → 404 Not found.
function parseId(raw: string): number | null {
  const n = parseInt(raw, 10);
  if (isNaN(n) || n <= 0) return null;
  return n;
}

interface Bottle {
  id: number;
  name: string;
  vintage: number | null;
  varietal: string | null;
  quantity: number;
  location: string | null;
  created_at: string;       // ISO 8601 UTC string
}

interface UpdateBottleRequest {
  name: string;             // Required; non-empty after trim; max 255 chars
  vintage?: number | null;  // Optional; integer in [1800, currentYear+1]
  varietal?: string | null; // Optional; max 255 chars
  quantity?: number;        // Optional; integer >= 0 (0 = finished bottle)
  location?: string | null; // Optional; max 500 chars
}

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const id = parseId(params.id);
  if (id === null) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  try {
    const result = await pool.query<Bottle>(
      'SELECT * FROM bottles WHERE id = $1',
      [id]
    );
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json(result.rows[0]);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const id = parseId(params.id);
  if (id === null) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  let body: UpdateBottleRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // Validate name
  if (!body.name || typeof body.name !== 'string' || body.name.trim().length === 0) {
    return NextResponse.json({ error: 'Name is required' }, { status: 422 });
  }
  if (body.name.trim().length > 255) {
    return NextResponse.json({ error: 'Name must be 255 characters or fewer' }, { status: 422 });
  }

  // Validate vintage
  const currentYear = new Date().getFullYear();
  if (body.vintage !== undefined && body.vintage !== null) {
    if (!Number.isInteger(body.vintage)) {
      return NextResponse.json({ error: 'Vintage must be a valid year' }, { status: 422 });
    }
    if (body.vintage < 1800 || body.vintage > currentYear + 1) {
      return NextResponse.json(
        { error: `Vintage must be between 1800 and ${currentYear + 1}` },
        { status: 422 }
      );
    }
  }

  // Validate varietal
  if (body.varietal !== undefined && body.varietal !== null) {
    if (typeof body.varietal !== 'string') {
      return NextResponse.json({ error: 'Varietal must be a string' }, { status: 422 });
    }
    if (body.varietal.length > 255) {
      return NextResponse.json({ error: 'Varietal must be 255 characters or fewer' }, { status: 422 });
    }
  }

  // Validate quantity — PUT allows 0 (finished bottle), rejects negative, rejects non-integer
  if (body.quantity !== undefined && body.quantity !== null) {
    if (!Number.isInteger(body.quantity)) {
      return NextResponse.json({ error: 'Quantity must be a whole number' }, { status: 422 });
    }
    if (body.quantity < 0) {
      return NextResponse.json({ error: 'Quantity cannot be negative' }, { status: 422 });
    }
  }

  // Validate location
  if (body.location !== undefined && body.location !== null) {
    if (typeof body.location !== 'string') {
      return NextResponse.json({ error: 'Location must be a string' }, { status: 422 });
    }
    if (body.location.length > 500) {
      return NextResponse.json({ error: 'Location must be 500 characters or fewer' }, { status: 422 });
    }
  }

  // Full replacement: absent optional fields → NULL
  const name = body.name.trim();
  const vintage = body.vintage ?? null;
  const varietal = (body.varietal !== undefined && body.varietal !== null && body.varietal.trim() !== '')
    ? body.varietal.trim()
    : null;
  const quantity = body.quantity ?? null;
  const location = (body.location !== undefined && body.location !== null && body.location.trim() !== '')
    ? body.location.trim()
    : null;

  try {
    const result = await pool.query<Bottle>(
      `UPDATE bottles
       SET name = $1, vintage = $2, varietal = $3, quantity = $4, location = $5
       WHERE id = $6
       RETURNING *`,
      [name, vintage, varietal, quantity, location, id]
    );
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json(result.rows[0]);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const id = parseId(params.id);
  if (id === null) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  try {
    const result = await pool.query(
      'DELETE FROM bottles WHERE id = $1 RETURNING id',
      [id]
    );
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return new Response(null, { status: 204 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
