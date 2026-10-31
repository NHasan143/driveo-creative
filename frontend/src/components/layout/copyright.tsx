"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * "© 2026 Driveo Exclusive Limited" with the current year. The prerendered page keeps the
 * dictionary's year; only the browser reads the clock, so prerendering stays deterministic.
 */
export function Copyright({ text }: { text: string }) {
  const year = useSyncExternalStore(
    subscribe,
    () => String(new Date().getFullYear()),
    () => null,
  );
  return <span>{year ? text.replace(/\b\d{4}\b/, year) : text}</span>;
}
