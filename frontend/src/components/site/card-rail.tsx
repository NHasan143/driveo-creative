"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowRightLargeIcon } from "@/components/icons/design-icons";
import { cn } from "@/lib/cn";

interface RailArrowsProps {
  labels: { previous: string; next: string };
  canPrevious: boolean;
  canNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
  className?: string;
}

/** The pair of round arrows from the design: cream "previous", ink "next". */
export function RailArrows({ labels, canPrevious, canNext, onPrevious, onNext, className }: RailArrowsProps) {
  const base =
    "grid size-10 place-items-center rounded-full transition-[background-color,opacity,transform] duration-200 hover:-translate-y-px disabled:pointer-events-none disabled:opacity-60 xl:size-12";
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <button
        type="button"
        aria-label={labels.previous}
        disabled={!canPrevious}
        onClick={onPrevious}
        className={cn(base, "bg-cream-border text-ink hover:bg-line-warm")}
      >
        <ArrowRightLargeIcon className="size-5 rotate-180 xl:size-6 rtl:rotate-0" />
      </button>
      <button
        type="button"
        aria-label={labels.next}
        disabled={!canNext}
        onClick={onNext}
        className={cn(base, "bg-ink text-white hover:bg-[#2a251e]")}
      >
        <ArrowRightLargeIcon className="size-5 xl:size-6 rtl:rotate-180" />
      </button>
    </div>
  );
}

interface CardRailProps {
  /** Left side of the header row (badge and title). */
  header: ReactNode;
  labels: { previous: string; next: string };
  children: ReactNode;
  /** Classes for the scrolling track, e.g. the gap between cards. */
  trackClassName?: string;
  /** Show the arrows on desktop as well (they always show on phones when the cards overflow). */
  desktopArrows?: boolean;
  className?: string;
}

/**
 * A horizontal row of cards that scrolls with swipes, the trackpad or the
 * arrow buttons. Cards snap into place; the arrows move one card at a time.
 */
export function CardRail({ header, labels, children, trackClassName, desktopArrows = true, className }: CardRailProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: true, end: true });

  const measure = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const max = track.scrollWidth - track.clientWidth;
    // scrollLeft is negative in right-to-left layouts.
    const position = Math.abs(track.scrollLeft);
    setEdges({ start: position <= 2, end: position >= max - 2 });
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(track);
    track.addEventListener("scroll", measure, { passive: true });
    return () => {
      observer.disconnect();
      track.removeEventListener("scroll", measure);
    };
  }, [measure]);

  function move(direction: 1 | -1) {
    const track = trackRef.current;
    if (!track) return;
    const card = track.firstElementChild as HTMLElement | null;
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    const step = (card?.offsetWidth ?? track.clientWidth) + gap;
    const rtl = getComputedStyle(track).direction === "rtl";
    track.scrollBy({ left: step * direction * (rtl ? -1 : 1), behavior: "smooth" });
  }

  const scrollable = !(edges.start && edges.end);
  const arrows = (
    <RailArrows
      labels={labels}
      canPrevious={!edges.start}
      canNext={!edges.end}
      onPrevious={() => move(-1)}
      onNext={() => move(1)}
    />
  );

  return (
    <div className={cn("flex flex-col gap-7 xl:gap-12", className)}>
      <div className="flex items-end justify-between gap-6">
        {header}
        {desktopArrows && <div className="hidden shrink-0 xl:block">{arrows}</div>}
      </div>
      <div
        ref={trackRef}
        className={cn(
          "no-scrollbar -my-4 flex snap-x snap-mandatory overflow-x-auto py-4 [&>*]:shrink-0 [&>*]:snap-start",
          trackClassName,
        )}
      >
        {children}
      </div>
      <div className={cn("xl:hidden", !scrollable && "hidden")}>{arrows}</div>
    </div>
  );
}
