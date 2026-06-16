// app/components/SearchInput.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useRef } from 'react';

interface SearchInputProps {
  defaultValue?: string;
}

/**
 * Debounced search input — F04-REQ-02.
 * On change: waits ≤500ms then calls router.replace('/?q=<term>', { scroll: false }).
 * Uses router.replace (not push) so the back button skips intermediate search states.
 * defaultValue pre-fills the input from the current ?q= URL param (F04-REQ-01).
 */
export default function SearchInput({ defaultValue = '' }: SearchInputProps) {
  const router = useRouter();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;

      // Clear existing debounce timer
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      // Debounce: wait 400ms (within ≤500ms spec) then update URL
      timerRef.current = setTimeout(() => {
        const q = value.trim();
        if (q.length > 0) {
          // router.replace — not push — so back button skips search intermediate states
          router.replace(`/?q=${encodeURIComponent(q)}`, { scroll: false });
        } else {
          // Empty search → restore full list (remove ?q=)
          router.replace('/', { scroll: false });
        }
      }, 400);
    },
    [router]
  );

  return (
    <div className="search-wrap">
      {/* Search icon */}
      <span className="search-icon" aria-hidden="true">🔍</span>
      {/* Pattern H: type="search" in GET form — works without JS, enhanced by JS onChange */}
      <input
        type="search"
        name="q"
        className="search-input"
        placeholder="Search bottles..."
        defaultValue={defaultValue}
        onChange={handleChange}
        aria-label="Search bottles by name"
        autoComplete="off"
      />
    </div>
  );
}
