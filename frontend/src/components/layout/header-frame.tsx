"use client";

import { useSyncExternalStore, type ReactNode } from "react";

function subscribe(onChange: () => void) {
  window.addEventListener("scroll", onChange, { passive: true });
  return () => window.removeEventListener("scroll", onChange);
}

/** Transparent over the page's hero; a solid bar once the visitor scrolls. */
export function HeaderFrame({ children }: { children: ReactNode }) {
  const scrolled = useSyncExternalStore(
    subscribe,
    () => window.scrollY > 24,
    () => false,
  );

  return (
    <header
      data-scrolled={scrolled || undefined}
      className="fixed inset-x-0 top-0 z-50 border-b border-transparent bg-gradient-to-b from-background/70 to-transparent transition-[background-color,border-color] duration-300 data-[scrolled]:border-border data-[scrolled]:bg-background/92 data-[scrolled]:backdrop-blur-md"
    >
      {children}
    </header>
  );
}
