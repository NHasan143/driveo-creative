"use client";

import type { HTMLAttributes, MouseEvent } from "react";

interface ParallaxSurfaceProps extends HTMLAttributes<HTMLElement> {
  as?: "div" | "section" | "article";
}

/**
 * Publishes the pointer position as `--mx` / `--my` CSS variables in the range
 * [-1, 1] so descendants can drive 3D depth effects purely in CSS.
 */
export function ParallaxSurface({ as: Component = "div", onMouseMove, ...props }: ParallaxSurfaceProps) {
  function handleMouseMove(event: MouseEvent<HTMLElement>) {
    const target = event.currentTarget;
    const rect = target.getBoundingClientRect();
    target.style.setProperty("--mx", `${((event.clientX - rect.left) / rect.width - 0.5) * 2}`);
    target.style.setProperty("--my", `${((event.clientY - rect.top) / rect.height - 0.5) * 2}`);
    onMouseMove?.(event);
  }

  return <Component {...props} onMouseMove={handleMouseMove} />;
}
