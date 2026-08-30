'use client';

import { useEffect, useState } from 'react';

/**
 * Tracks which section id is currently in view within a scroll container.
 * Used by the sidebar to show an active-page indicator without routing.
 */
export function useScrollSpy(
  ids: string[],
  options?: { rootMargin?: string; root?: React.RefObject<HTMLElement | null> }
) {
  const [activeId, setActiveId] = useState<string>(ids[0] ?? '');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const visible = new Map<string, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            visible.set(entry.target.id, entry.intersectionRatio);
          } else {
            visible.delete(entry.target.id);
          }
        }
        if (visible.size === 0) return;
        // Pick the section closest to the top (first in id order that is visible).
        const next = ids.find((id) => visible.has(id));
        if (next) setActiveId(next);
      },
      {
        root: options?.root?.current ?? null,
        rootMargin: options?.rootMargin ?? '-45% 0px -50% 0px',
        threshold: [0, 0.1, 0.5, 1],
      }
    );

    const nodes = ids
      .map((id) => document.getElementById(id))
      .filter((n): n is HTMLElement => !!n);
    nodes.forEach((n) => observer.observe(n));

    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids.join('|')]);

  return activeId;
}
