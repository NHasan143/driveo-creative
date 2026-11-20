"use client";

import { useSelectedLayoutSegment } from "next/navigation";
import { useSyncExternalStore, type ReactNode } from "react";

function subscribe(onChange: () => void) {
  window.addEventListener("scroll", onChange, { passive: true });
  return () => window.removeEventListener("scroll", onChange);
}

/**
 * White bar on every page. On the home page it starts transparent, with white
 * text over the hero photograph, and turns white once the visitor scrolls.
 * Children style themselves with `group-data-[overlay]/header:` variants.
 */
export function HeaderFrame({ children }: { children: ReactNode }) {
  const home = useSelectedLayoutSegment() === null;
  const scrolled = useSyncExternalStore(
    subscribe,
    () => window.scrollY > 24,
    () => false,
  );
  const overlay = home && !scrolled;

  return (
    <header
      data-overlay={overlay || undefined}
      data-home={home || undefined}
      className="group/header fixed inset-x-0 top-0 z-50 bg-white text-stone transition-[background-color,box-shadow,color] duration-300 data-[overlay]:bg-transparent data-[overlay]:text-white [&:not([data-overlay])]:shadow-[0_1px_0_var(--cream-border)]"
    >
      {children}
    </header>
  );
}
