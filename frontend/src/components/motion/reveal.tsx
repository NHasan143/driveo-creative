"use client";

import { useRef, type ElementType, type ReactNode } from "react";
import { FULL_MOTION, gsap, useGSAP } from "./gsap";

interface RevealProps {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  /** Animate direct children one after another instead of the wrapper as a whole. */
  stagger?: boolean;
  y?: number;
}

/**
 * Fades and lifts content into view as it scrolls into the viewport.
 * Content is rendered visible on the server; motion is applied only when the
 * user has not asked for reduced motion.
 */
export function Reveal({ children, as: Tag = "div", className, stagger = false, y = 36 }: RevealProps) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const root = ref.current;
      if (!root) return;

      gsap.matchMedia().add(FULL_MOTION, () => {
        const targets = stagger ? Array.from(root.children) : root;
        gsap.from(targets, {
          autoAlpha: 0,
          y,
          duration: 1,
          ease: "power3.out",
          stagger: stagger ? 0.12 : 0,
          // Hand transforms back to CSS so hover effects keep working afterwards.
          clearProps: "transform,opacity,visibility",
          scrollTrigger: { trigger: root, start: "top 85%", once: true },
        });
      });
    },
    { scope: ref },
  );

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}
