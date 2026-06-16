// app/page.tsx
import Link from 'next/link';
import pool from '@/lib/db';
import type { Bottle } from '@/types/bottle';
import SearchInput from '@/app/components/SearchInput';

interface HomePageProps {
  searchParams: { q?: string };
}

/**
 * Bottle List Page — F0 + F4.
 * Server Component: renders on every request; no client-side data fetch on initial load.
 * Accepts ?q= for ILIKE search filtering (F04-REQ-02 to F04-REQ-08).
 */
export default async function Home({ searchParams }: HomePageProps) {
  const rawQ = searchParams.q ?? '';
  const q = rawQ.trim().slice(0, 500);  // cap at 500 chars per F04-REQ-08

  let bottles: Bottle[] = [];
  let dbError = false;

  try {
    let result;
    if (q.length > 0) {
      // ILIKE filter — parameterised, never interpolated (F04-REQ-05, F00-REQ-08)
      result = await pool.query<Bottle>(
        'SELECT * FROM bottles WHERE name ILIKE $1 ORDER BY created_at DESC',
        [`%${q}%`]
      );
    } else {
      // All bottles, newest first (F00-REQ-01)
      result = await pool.query<Bottle>(
        'SELECT * FROM bottles ORDER BY created_at DESC'
      );
    }
    bottles = result.rows;
  } catch {
    // DB error — F00-REQ-07: render error boundary message
    dbError = true;
  }

  // ── Error state (F00-REQ-07) ────────────────────────────────────────────────
  if (dbError) {
    return (
      <div className="container page-content">
        <SearchInput defaultValue={q} />
        <div className="error-banner" role="alert">
          Unable to load cellar. Please try again.
        </div>
      </div>
    );
  }

  // ── Determine render state ──────────────────────────────────────────────────
  const isEmpty = bottles.length === 0;
  const isSearchEmpty = isEmpty && q.length > 0;
  const isCellarEmpty = isEmpty && q.length === 0;

  return (
    <div className="container page-content">
      {/* Search input — F04-REQ-01: always visible, pre-filled with current ?q= */}
      <SearchInput defaultValue={q} />

      {/* ── State 1: Cellar empty — F00-REQ-03 ────────────────────────────── */}
      {isCellarEmpty && (
        <div className="empty-state">
          <div className="empty-icon" aria-hidden="true">🍷</div>
          <p className="empty-title">No bottles yet.</p>
          <p className="empty-subtitle">
            Add your first bottle to start tracking your cellar.
          </p>
          {/* Gold CTA button → /bottles/new (F00-REQ-06) */}
          <Link href="/bottles/new" className="btn-primary empty-cta">
            + Add your first bottle
          </Link>
        </div>
      )}

      {/* ── State 2: Search returned no results — F00-REQ-04, F04-REQ-06 ──── */}
      {isSearchEmpty && (
        <div className="search-empty">
          {/* Message includes the search term — US-4.3 */}
          <p className="search-empty-msg">No bottles match &ldquo;{q}&rdquo;.</p>
          {/* Add bottle still accessible — US-4.3 acceptance criterion */}
          <Link href="/bottles/new" className="btn-primary">
            + Add bottle
          </Link>
        </div>
      )}

      {/* ── State 3: Normal list — F00-REQ-02, F00-REQ-05 ─────────────────── */}
      {!isEmpty && (
        <ul className="bottle-list" aria-label="Wine collection">
          {bottles.map((bottle) => {
            // Build metadata line: vintage · varietal · Qty N · location
            // Show dash for null optional fields
            const vintage = bottle.vintage ?? null;
            const varietal = bottle.varietal ?? null;
            const location = bottle.location ?? null;

            // Line 2: "2019 · Cabernet Sauvignon" or "— · —" etc.
            const vintagePart = vintage ? String(vintage) : '—';
            const varietalPart = varietal || '—';
            const locationPart = location || '—';

            return (
              // F00-REQ-05: each row is <a> → /bottles/[id]/edit
              // Pattern D: min-height 56px, full-width tap target ≥44px
              <li key={bottle.id}>
                <a
                  href={`/bottles/${bottle.id}/edit`}
                  className="bottle-row"
                  aria-label={`Edit ${bottle.name}`}
                >
                  <div className="bottle-row-inner">
                    {/* Primary: bottle name — 16px bold */}
                    <span className="bottle-name">{bottle.name}</span>
                    {/* Secondary: vintage · varietal · qty · location — 13px muted */}
                    <span className="bottle-meta">
                      {vintagePart} · {varietalPart} &nbsp;|&nbsp; Qty: {bottle.quantity} · {locationPart}
                    </span>
                  </div>
                </a>
              </li>
            );
          })}
        </ul>
      )}

      {/* Add bottle button always visible in non-empty list — F00-REQ-06, US-0.4 */}
      {!isEmpty && (
        <div style={{ paddingTop: '16px' }}>
          <Link href="/bottles/new" className="btn-primary">
            + Add bottle
          </Link>
        </div>
      )}
    </div>
  );
}
