"use client";

import { useEffect } from "react";

/** Asks for confirmation before closing, reloading, or navigating away while there are unsaved edits. */
export function useUnsavedChangesWarning(dirty: boolean) {
  useEffect(() => {
    if (!dirty) return;

    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };

    const handleLinkClick = (event: MouseEvent) => {
      const target = (event.target as HTMLElement | null)?.closest("a");
      if (!target || !target.href || target.target === "_blank") return;

      try {
        const currentUrl = new URL(window.location.href);
        const targetUrl = new URL(target.href, window.location.href);
        if (targetUrl.pathname !== currentUrl.pathname) {
          const confirmed = window.confirm("You have unsaved changes. Are you sure you want to leave this page?");
          if (!confirmed) {
            event.preventDefault();
            event.stopPropagation();
          }
        }
      } catch {
        // Ignore invalid URLs
      }
    };

    window.addEventListener("beforeunload", warn);
    document.addEventListener("click", handleLinkClick, true);

    return () => {
      window.removeEventListener("beforeunload", warn);
      document.removeEventListener("click", handleLinkClick, true);
    };
  }, [dirty]);
}
