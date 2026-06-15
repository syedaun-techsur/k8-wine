// app/layout.tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'CellarLite — My Wine Cellar',
  description: 'Personal wine cellar tracker',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        {/* Navigation bar — Pattern J: 56px bar, logo left, Add right */}
        <nav className="nav" aria-label="Main navigation">
          <div className="nav-inner">
            {/* "My Cellar" wordmark — links to / */}
            <Link href="/" className="nav-logo">
              My Cellar
            </Link>
            {/* "+ Add" pill button — links to /bottles/new */}
            {/* Mobile: short label; ≥480px: full label via CSS */}
            <Link href="/bottles/new" className="nav-add" aria-label="Add a new bottle">
              <span className="nav-add-short">+ Add</span>
              <span className="nav-add-full"> bottle</span>
            </Link>
          </div>
        </nav>

        {/* Page content */}
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}
