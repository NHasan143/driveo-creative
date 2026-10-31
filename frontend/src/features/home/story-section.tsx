"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

interface StoryItem {
  title: string;
  copy: string;
  image: string;
}

/**
 * A pinned photo whose picture and caption change as the visitor scrolls past
 * each step. Invisible markers, one per step, sit behind the pinned frame.
 */
export function StorySection({ title, items }: { title: string; items: StoryItem[] }) {
  const [active, setActive] = useState(0);
  const markers = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(Number((entry.target as HTMLElement).dataset.step));
        }
      },
      { rootMargin: "-50% 0px -50% 0px" },
    );
    for (const marker of markers.current) if (marker) observer.observe(marker);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="py-24 sm:py-32">
      <h2 className="site-shell text-center font-display text-[clamp(2.4rem,5vw,4.2rem)] leading-[1.05] font-medium text-balance">
        {title}
      </h2>

      <div className="site-shell relative mt-14">
        <div className="sticky top-[calc(var(--header-height)+1.5rem)] h-[72svh] overflow-hidden rounded-3xl bg-muted">
          {items.map((item, index) => (
            <Image
              key={item.title}
              src={item.image}
              alt=""
              fill
              sizes="(min-width: 1320px) 1320px, 100vw"
              className={cn(
                "object-cover transition-opacity duration-700",
                index === active ? "opacity-100" : "opacity-0",
              )}
            />
          ))}
          <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />

          <ol className="absolute inset-x-4 bottom-4 sm:inset-x-6 sm:bottom-6">
            {items.map((item, index) => (
              <li
                key={item.title}
                aria-current={index === active ? "step" : undefined}
                className={cn(
                  "max-w-xl rounded-2xl border border-border bg-background/70 p-5 backdrop-blur-md transition-opacity duration-500 sm:p-6",
                  index === active ? "relative opacity-100" : "pointer-events-none absolute inset-x-0 bottom-0 opacity-0",
                )}
              >
                <p className="font-display text-2xl font-medium">{item.title}</p>
                <p className="mt-2 text-sm leading-6 text-foreground/80">{item.copy}</p>
              </li>
            ))}
          </ol>

          <div aria-hidden="true" className="absolute end-5 top-5 flex gap-1.5">
            {items.map((item, index) => (
              <span
                key={item.title}
                className={cn("h-1.5 rounded-full transition-all", index === active ? "w-6 bg-primary" : "w-1.5 bg-foreground/40")}
              />
            ))}
          </div>
        </div>

        {/* One marker per step; the frame above stays pinned while they scroll past. */}
        <div aria-hidden="true" className="pointer-events-none -mt-[72svh]">
          {items.map((item, index) => (
            <div
              key={item.title}
              data-step={index}
              ref={(element) => {
                markers.current[index] = element;
              }}
              className="h-[72svh]"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
