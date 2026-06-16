// app/layout.tsx
// Root layout — Server Component (no 'use client' directive)
// Renders: HTML shell + nav bar + page content area
// Imported by: all pages automatically (Next.js App Router convention)

import type { Metadata } from 'next';
import Link from 'next/link';
import '../styles/globals.css';

// Page metadata — title shown in browser tab + SEO
export const metadata: Metadata = {
  title: 'CellarLite',
  description: 'Personal wine cellar tracker',
};

// Viewport must be exported separately from metadata in Next.js 14
export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>
        {/* Navigation bar (Pattern J, UX-Mockup)
            Height: 56px | Two links only: My Cellar (/) and + Add (/bottles/new)
            No dead links, no footer nav (UX-Mockup Navigation Structure) */}
        <nav className="nav">
          {/* Left: wordmark — links to list page */}
          <Link href="/" className="nav__brand">
            My Cellar
          </Link>

          {/* Right: Add bottle pill button
              Mobile: "+ Add" | ≥480px: "+ Add bottle"
              (UX-Mockup Pattern J: min-height 36px inside 56px bar) */}
          <Link href="/bottles/new" className="nav__add" aria-label="Add a new bottle">
            <span aria-hidden="true">+&nbsp;</span>
            <span className="nav__add-short">Add</span>
            <span className="nav__add-long" aria-hidden="true"> bottle</span>
          </Link>
        </nav>

        {/* Page content — wrapped in container for max-width centering */}
        <main>
          <div className="container">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
