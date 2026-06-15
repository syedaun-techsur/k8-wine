'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function EditBottlePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [name, setName] = useState('');
  const [vintage, setVintage] = useState('');
  const [varietal, setVarietal] = useState('');
  const [quantity, setQuantity] = useState('');
  const [location, setLocation] = useState('');
  const [nameError, setNameError] = useState('');
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    // Validate id is a positive integer before fetching
    const numId = parseInt(id, 10);
    if (isNaN(numId) || numId <= 0) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    fetch(`/api/bottles/${id}`)
      .then(async res => {
        if (res.status === 404) {
          setNotFound(true);
          return;
        }
        const bottle = await res.json();
        setName(bottle.name ?? '');
        setVintage(bottle.vintage != null ? String(bottle.vintage) : '');
        setVarietal(bottle.varietal ?? '');
        setQuantity(bottle.quantity != null ? String(bottle.quantity) : '1');
        setLocation(bottle.location ?? '');
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setNameError('');
    setServerError('');

    if (!name.trim()) {
      setNameError('Name is required');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/bottles/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          vintage: vintage ? parseInt(vintage, 10) : null,
          varietal: varietal.trim() || null,
          quantity: quantity !== '' ? parseInt(quantity, 10) : null,
          location: location.trim() || null,
        }),
      });
      if (res.status === 200) {
        router.push('/');
        return;
      }
      const data = await res.json();
      if (res.status === 422) {
        setServerError(data.error ?? 'Validation error');
      } else {
        setServerError('Something went wrong. Please try again.');
      }
    } catch {
      setServerError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm('Delete this bottle?')) return;
    setDeleting(true);
    setServerError('');
    try {
      const res = await fetch(`/api/bottles/${id}`, { method: 'DELETE' });
      if (res.status === 204) {
        router.push('/');
        return;
      }
      if (res.status === 404) {
        setServerError('This bottle could not be deleted. It may have already been removed.');
      } else {
        setServerError('Something went wrong. Please try again.');
      }
    } catch {
      setServerError('Something went wrong. Please try again.');
    } finally {
      setDeleting(false);
    }
  }

  const inputStyle = {
    width: '100%',
    height: '48px',
    fontSize: '16px',
    padding: '0 12px',
    border: '1px solid #E5E7EB',
    borderRadius: '6px',
    color: '#0A0A0A',
    background: '#FFFFFF',
    boxSizing: 'border-box' as const,
  };

  const labelStyle = {
    display: 'block',
    fontSize: '14px',
    fontWeight: 500 as const,
    color: '#0A0A0A',
    marginBottom: '4px',
  };

  // Loading state — layout nav provides navigation
  if (loading) {
    return (
      <div style={{ padding: '24px 16px', textAlign: 'center', color: '#6B7280' }}>Loading…</div>
    );
  }

  // Not found state (US-2.6) — non-integer id OR 404 from API
  // Layout nav provides the only a[href="/"] on this page (nav-logo)
  if (notFound) {
    return (
      <div style={{ width: '100%', maxWidth: '480px', margin: '0 auto', padding: '48px 16px', textAlign: 'center' }}>
        <p style={{ fontSize: '16px', fontWeight: 700, color: '#0A0A0A', marginBottom: '8px' }}>Bottle not found.</p>
        <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '24px' }}>This bottle may have been removed or the link is incorrect.</p>
      </div>
    );
  }

  // Edit form
  return (
    <div style={{ minHeight: '100vh', background: '#FFFFFF' }}>
      {/* Nav bar — Pattern J */}
      <nav style={{
        height: '56px',
        background: '#FFFFFF',
        borderBottom: '1px solid #E5E7EB',
        boxShadow: '0 1px 3px rgba(0,0,0,0.07)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
      }}>
        <a href="/" style={{ fontSize: '18px', fontWeight: 700, color: '#0A0A0A', textDecoration: 'none' }}>← My Cellar</a>
        <span style={{ fontSize: '16px', fontWeight: 600, color: '#0A0A0A' }}>Edit Bottle</span>
      </nav>

      <div style={{ width: '100%', maxWidth: '480px', margin: '0 auto', padding: '24px 16px', boxSizing: 'border-box' }}>
        {/* Server error banner — Pattern G */}
        {serverError && (
          <div role="alert" style={{
            background: '#FFF1F0',
            borderLeft: '4px solid #D93025',
            padding: '12px 16px',
            marginBottom: '16px',
            fontSize: '14px',
            color: '#991B1B',
          }}>
            ⚠ {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Name field */}
          <div style={{ marginBottom: '16px' }}>
            <label htmlFor="edit-name" style={labelStyle}>Name *</label>
            <input
              id="edit-name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              style={{ ...inputStyle, border: nameError ? '2px solid #D93025' : '1px solid #E5E7EB' }}
            />
            {nameError && (
              <p role="alert" style={{ margin: '4px 0 0', fontSize: '13px', color: '#D93025' }}>⚠ {nameError}</p>
            )}
          </div>

          {/* Vintage field */}
          <div style={{ marginBottom: '16px' }}>
            <label htmlFor="edit-vintage" style={labelStyle}>Vintage</label>
            <input
              id="edit-vintage"
              type="number"
              min="1800"
              max="2027"
              value={vintage}
              onChange={e => setVintage(e.target.value)}
              style={inputStyle}
            />
          </div>

          {/* Varietal field */}
          <div style={{ marginBottom: '16px' }}>
            <label htmlFor="edit-varietal" style={labelStyle}>Varietal</label>
            <input
              id="edit-varietal"
              type="text"
              value={varietal}
              onChange={e => setVarietal(e.target.value)}
              style={inputStyle}
            />
          </div>

          {/* Quantity field — select-all on focus (UX-Mockup Pattern) */}
          <div style={{ marginBottom: '16px' }}>
            <label htmlFor="edit-quantity" style={labelStyle}>Quantity</label>
            <input
              id="edit-quantity"
              type="number"
              min="0"
              value={quantity}
              onChange={e => setQuantity(e.target.value)}
              onFocus={e => e.target.select()}
              style={inputStyle}
            />
          </div>

          {/* Location field */}
          <div style={{ marginBottom: '24px' }}>
            <label htmlFor="edit-location" style={labelStyle}>Location</label>
            <input
              id="edit-location"
              type="text"
              value={location}
              onChange={e => setLocation(e.target.value)}
              style={inputStyle}
            />
          </div>

          {/* Save Changes button — Pattern A: Gold primary */}
          <button
            type="submit"
            disabled={submitting}
            style={{
              width: '100%',
              height: '48px',
              background: '#FBCA5C',
              color: '#0A0A0A',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: 600,
              cursor: submitting ? 'not-allowed' : 'pointer',
              opacity: submitting ? 0.6 : 1,
            }}
          >
            Save Changes
          </button>
        </form>

        {/* Delete section — visually separated from Save (UX-Mockup: ≥24px gap + divider) */}
        <div style={{ marginTop: '24px', borderTop: '1px solid #E5E7EB', paddingTop: '24px' }}>
          {/* Delete button — Pattern B: Destructive secondary */}
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            style={{
              width: '100%',
              height: '44px',
              background: 'transparent',
              color: '#B91C1C',
              border: '1px solid #B91C1C',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: 500,
              cursor: deleting ? 'not-allowed' : 'pointer',
              opacity: deleting ? 0.5 : 1,
              marginBottom: '16px',
            }}
          >
            Delete Bottle
          </button>

          {/* Cancel link — Pattern C: below Delete */}
          <div style={{ textAlign: 'center' }}>
            <a
              href="/"
              style={{
                display: 'inline-block',
                padding: '8px 16px',
                fontSize: '14px',
                color: '#6B7280',
                textDecoration: 'none',
                minHeight: '44px',
                lineHeight: '28px',
              }}
            >
              Cancel
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
