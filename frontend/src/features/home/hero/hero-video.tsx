"use client";

import { useState } from "react";

interface HeroVideoProps {
  sources: readonly string[];
  poster: string;
  label: string;
  className?: string;
}

/** Plays each journey film in turn, looping back to the first. */
export function HeroVideo({ sources, poster, label, className }: HeroVideoProps) {
  const [index, setIndex] = useState(0);

  return (
    <video
      key={index}
      className={className}
      autoPlay
      muted
      playsInline
      preload="auto"
      poster={poster}
      aria-label={label}
      onEnded={() => setIndex((current) => (current + 1) % sources.length)}
    >
      <source src={sources[index]} type="video/mp4" />
    </video>
  );
}
