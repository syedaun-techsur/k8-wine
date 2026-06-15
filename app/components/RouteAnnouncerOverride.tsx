'use client';

import { useEffect } from 'react';

/**
 * Removes role="alert" from the Next.js App Router route announcer
 * to prevent it from conflicting with inline form error role="alert" elements.
 * The announcer retains aria-live="assertive" for screen reader compatibility.
 */
export default function RouteAnnouncerOverride() {
  useEffect(() => {
    const fixAnnouncer = (el?: Element) => {
      const container = el ?? document.querySelector('next-route-announcer');
      if (!container) return;
      const shadow = container.shadowRoot;
      if (!shadow) return;
      const announcer = shadow.getElementById('__next-route-announcer__');
      if (announcer) {
        announcer.removeAttribute('role');
      }
    };

    // Try immediately in case it was already created
    fixAnnouncer();

    // Watch for the custom element being added to the body
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof Element && node.tagName.toLowerCase() === 'next-route-announcer') {
            fixAnnouncer(node);
          }
        });
      }
    });

    observer.observe(document.body, { childList: true });

    return () => observer.disconnect();
  }, []);

  return null;
}
