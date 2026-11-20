import Image from "next/image";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/cn";

interface BrandLogoProps {
  /** `dark`: ink wordmark for light backgrounds; `light`: white wordmark for dark ones. */
  tone?: "dark" | "light";
  /** Text under the wordmark, e.g. "Exclusive". The white artwork already includes it. */
  tagline: string;
  priority?: boolean;
  className?: string;
}

/** The DRiVEO EXCLUSIVE wordmark from the design (125×49 on desktop, 106×42 on phones). */
export function BrandLogo({ tone = "dark", tagline, priority = false, className }: BrandLogoProps) {
  if (tone === "light") {
    return (
      <span className={cn("relative block h-[2.625rem] w-[6.875rem] xl:h-12 xl:w-[7.875rem]", className)}>
        <Image
          src={siteConfig.assets.wordmarkLight}
          alt={siteConfig.name}
          fill
          sizes="126px"
          priority={priority}
          className="object-contain"
        />
      </span>
    );
  }

  return (
    <span className={cn("flex w-[6.625rem] flex-col items-center gap-[5px] xl:w-[7.8125rem] xl:gap-2", className)}>
      <span className="relative block h-[1.5625rem] w-full xl:h-[1.8125rem]">
        <Image
          src={siteConfig.assets.wordmarkDark}
          alt={siteConfig.name}
          fill
          sizes="125px"
          priority={priority}
          className="object-contain"
        />
      </span>
      <span
        aria-hidden="true"
        className="text-[0.5rem] leading-none font-semibold tracking-[0.32em] text-[#f1aa35] uppercase xl:text-[0.625rem] xl:leading-[1.2]"
      >
        {tagline}
      </span>
    </span>
  );
}
