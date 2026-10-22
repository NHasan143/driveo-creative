"use client";

import { useRef, type ReactNode } from "react";
import { FULL_MOTION, gsap, useGSAP } from "@/components/motion/gsap";

/** Lets the hero copy drift up and dissolve as the visitor scrolls past it. */
export function HeroScrollFade({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const element = ref.current;
      const section = element?.closest("section");
      if (!element || !section) return;

      gsap.matchMedia().add(FULL_MOTION, () => {
        gsap.to(element, {
          yPercent: -12,
          autoAlpha: 0.15,
          ease: "none",
          scrollTrigger: { trigger: section, start: "top top", end: "bottom top", scrub: true },
        });
      });
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
