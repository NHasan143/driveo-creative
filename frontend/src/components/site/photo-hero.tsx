import Image from "next/image";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { isRemoteImage } from "@/lib/remote-image";
import { HeroChecks } from "./check-list";

interface PhotoHeroProps {
  image: string;
  imageAlt: string;
  /** e.g. `object-[30%_center]` to keep the subject in frame on phones. */
  imageClassName?: string;
  lead: string;
  accent?: string;
  /** Put the orange half on its own line. */
  stacked?: boolean;
  sub?: string;
  /** The call to action or the booking panel. */
  children?: ReactNode;
  /** White ticks along the bottom edge. */
  checks?: string[];
  /** `bottom` sits the content at the foot (booking panel); `center` centres it. */
  align?: "bottom" | "center";
  className?: string;
}

/** Inner-page hero from the design: photograph under the header, white serif title with an orange half. */
export function PhotoHero({
  image,
  imageAlt,
  imageClassName,
  lead,
  accent,
  stacked = false,
  sub,
  children,
  checks,
  align = "center",
  className,
}: PhotoHeroProps) {
  return (
    <section className={cn("relative isolate mt-[var(--header-height)] flex overflow-hidden bg-[#f4f4f4]", className)}>
      <Image
        src={image}
        alt={imageAlt}
        fill
        priority
        sizes="100vw"
        className={cn("-z-20 object-cover", imageClassName)}
        unoptimized={isRemoteImage(image)}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(0,0,0,0.16)_9%,rgba(0,0,0,0.05)_31%,rgba(0,0,0,0.02)_64%,rgba(0,0,0,0.5)_84%)]"
      />
      {align === "bottom" && (
        <div
          aria-hidden="true"
          className="absolute inset-x-[-2%] bottom-0 -z-10 h-[56%] bg-[linear-gradient(180deg,rgba(25,22,18,0.2)_10%,rgb(25,22,18)_100%)] blur-[13.5px]"
        />
      )}

      <div
        className={cn(
          "site-shell relative flex w-full flex-col items-center text-center",
          align === "bottom" ? "justify-end pt-24 pb-5 xl:max-w-[63rem] xl:pb-6" : "justify-center py-20 xl:py-0",
        )}
      >
        <div aria-hidden="true" className="hero-glow absolute inset-x-[-10%] top-1/2 -z-10 h-64 -translate-y-1/2 xl:inset-x-[5%]" />
        <h1 className="font-display text-[2.25rem] leading-[1.08] font-medium tracking-[-0.02em] text-balance text-white xl:text-[4.25rem]">
          {lead}
          {accent && (
            <>
              {stacked ? <br /> : " "}
              <span className="text-orange">{accent}</span>
            </>
          )}
        </h1>
        {sub && (
          <p className="mt-4 max-w-[27rem] text-sm leading-[1.6] font-medium tracking-[-0.03em] text-[#e9e9e9] xl:text-[0.9375rem]">{sub}</p>
        )}
        {children && <div className={cn("w-full", align === "bottom" ? "mt-8 xl:mt-14" : "mt-8 flex justify-center")}>{children}</div>}
        {checks && checks.length > 0 && (
          <HeroChecks items={checks} className="mt-12 xl:absolute xl:bottom-6 xl:left-1/2 xl:mt-0 xl:-translate-x-1/2 xl:whitespace-nowrap" />
        )}
      </div>
    </section>
  );
}
