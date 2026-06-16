'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewBottlePage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [vintage, setVintage] = useState('');
  const [varietal, setVarietal] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [location, setLocation] = useState('');
  const [nameError, setNameError] = useState('');
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

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
      const res = await fetch('/api/bottles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          vintage: vintage ? parseInt(vintage, 10) : null,
          varietal: varietal.trim() || null,
          quantity: quantity ? parseInt(quantity, 10) : 1,
          location: location.trim() || null,
        }),
      });
      if (res.status === 201) {
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
        <a href="/" style={{ fontSize: '18px', fontWeight: 700, color: '#0A0A0A', textDecoration: 'none' }}>
          ← My Cellar
        </a>
        <span style={{ fontSize: '16px', fontWeight: 600, color: '#0A0A0A' }}>Add Bottle</span>
      </nav>

      {/* Form container */}
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
          {/* Name field — required */}
          <div style={{ marginBottom: '16px' }}>
            <label htmlFor="name" style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#0A0A0A', marginBottom: '4px' }}>
              Name *
            </label>
            <input
              id="name"
              type="text"
              autoFocus
              value={name}
              onChange={e => setName(e.target.value)}
              style={{
                width: '100%',
                height: '48px',
                fontSize: '16px',
                padding: '0 12px',
                border: nameError ? '2px solid #D93025' : '1px solid #E5E7EB',
                borderRadius: '6px',
                color: '#0A0A0A',
                background: '#FFFFFF',
                boxSizing: 'border-box',
              }}
            />
            {nameError && (
              <p role="alert" style={{ margin: '4px 0 0', fontSize: '13px', color: '#D93025' }}>⚠ {nameError}</p>
            )}
          </div>

          {/* Vintage field */}
          <div style={{ marginBottom: '16px' }}>
            <label htmlFor="vintage" style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#0A0A0A', marginBottom: '4px' }}>
              Vintage
            </label>
            <input
              id="vintage"
              type="number"
              min="1800"
              max="2027"
              value={vintage}
              onChange={e => setVintage(e.target.value)}
              style={{
                width: '100%',
                height: '48px',
                fontSize: '16px',
                padding: '0 12px',
                border: '1px solid #E5E7EB',
                borderRadius: '6px',
                color: '#0A0A0A',
                background: '#FFFFFF',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Varietal field */}
          <div style={{ marginBottom: '16px' }}>
            <label htmlFor="varietal" style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#0A0A0A', marginBottom: '4px' }}>
              Varietal
            </label>
            <input
              id="varietal"
              type="text"
              value={varietal}
              onChange={e => setVarietal(e.target.value)}
              style={{
                width: '100%',
                height: '48px',
                fontSize: '16px',
                padding: '0 12px',
                border: '1px solid #E5E7EB',
                borderRadius: '6px',
                color: '#0A0A0A',
                background: '#FFFFFF',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Quantity field */}
          <div style={{ marginBottom: '16px' }}>
            <label htmlFor="quantity" style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#0A0A0A', marginBottom: '4px' }}>
              Quantity
            </label>
            <input
              id="quantity"
              type="number"
              min="1"
              value={quantity}
              onChange={e => setQuantity(e.target.value)}
              style={{
                width: '100%',
                height: '48px',
                fontSize: '16px',
                padding: '0 12px',
                border: '1px solid #E5E7EB',
                borderRadius: '6px',
                color: '#0A0A0A',
                background: '#FFFFFF',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Location field */}
          <div style={{ marginBottom: '24px' }}>
            <label htmlFor="location" style={{ display: 'block', fontSize: '14px', fontWeight: 500, color: '#0A0A0A', marginBottom: '4px' }}>
              Location
            </label>
            <input
              id="location"
              type="text"
              value={location}
              onChange={e => setLocation(e.target.value)}
              style={{
                width: '100%',
                height: '48px',
                fontSize: '16px',
                padding: '0 12px',
                border: '1px solid #E5E7EB',
                borderRadius: '6px',
                color: '#0A0A0A',
                background: '#FFFFFF',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Save button — Pattern A: Gold primary */}
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
              marginBottom: '16px',
            }}
          >
            Save Bottle
          </button>

          {/* Cancel link — Pattern C */}
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
        </form>
      </div>
    </div>
  );
}
