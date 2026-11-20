import { ArrowDown, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { localePath, type Locale } from "@/i18n/config";
import { cn } from "@/lib/cn";
import { isRemoteImage } from "@/lib/remote-image";

export interface Crumb {
  label: string;
  /** Omitted for the current page. */
  path?: string;
}

interface PageBannerProps {
  locale: Locale;
  title: string;
  intro?: string;
  /** Without an image the banner is a plain cream band. */
  image?: string;
  /** Usually the booking bar. */
  children?: ReactNode;
  crumbs: Crumb[];
  /** "Explore more" link to the first section, `#content`. */
  explore?: string;
}

/** Inner-page hero in the design's style: photo under a dark fade, white serif title and the booking bar. */
export function PageBanner({ locale, title, intro, image, children, crumbs, explore }: PageBannerProps) {
  return (
    <>
      <section
        className={cn(
          "relative isolate flex items-end overflow-hidden pt-[var(--header-height)]",
          image ? "min-h-[41rem] bg-[#f4f4f4] text-white" : "min-h-[22rem] bg-cream text-ink",
        )}
      >
        {image && (
          <>
            <Image
              src={image}
              alt=""
              fill
              priority
              sizes="100vw"
              className="-z-20 object-cover"
              unoptimized={isRemoteImage(image)}
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(0,0,0,0.16)_9%,rgba(0,0,0,0.05)_31%,rgba(0,0,0,0.02)_64%,rgba(0,0,0,0.5)_84%)]"
            />
            <div
              aria-hidden="true"
              className="absolute inset-x-0 bottom-0 -z-10 h-[56%] bg-[linear-gradient(180deg,rgba(25,22,18,0.2)_10%,rgb(25,22,18)_100%)] blur-[13.5px]"
            />
          </>
        )}
        <div className="site-shell pt-16 pb-8 xl:pb-6">
          <h1 className="mx-auto max-w-4xl text-center font-display text-[2.5rem] leading-none font-medium tracking-[-0.02em] text-balance xl:text-[4.25rem]">
            {title}
          </h1>
          {intro && (
            <p className={cn("mx-auto mt-4 max-w-[27rem] text-center text-[0.9375rem] leading-[1.6] font-medium tracking-[-0.03em]", image ? "text-[#e9e9e9]" : "text-muted-text")}>
              {intro}
            </p>
          )}
          {children && <div className="mx-auto mt-8 max-w-[63rem]">{children}</div>}
          {explore && (
            <a
              href="#content"
              className={cn(
                "mx-auto mt-6 flex w-fit items-center gap-2 text-sm font-medium transition-opacity hover:opacity-75",
                image ? "text-white/85" : "text-muted-text",
              )}
            >
              {explore} <ArrowDown aria-hidden="true" className="size-4" />
            </a>
          )}
        </div>
      </section>

      <nav aria-label="Breadcrumb" className="site-shell py-6">
        <ol className="flex flex-wrap items-center justify-center gap-2 text-sm text-muted-text">
          {crumbs.map((crumb, index) => (
            <li key={crumb.label} className="flex items-center gap-2">
              {index > 0 && <ChevronRight aria-hidden="true" className="size-3.5 rtl:-scale-x-100" />}
              {crumb.path ? (
                <Link href={localePath(locale, crumb.path)} className="text-amber-text transition-colors hover:text-ink">
                  {crumb.label}
                </Link>
              ) : (
                <span aria-current="page">{crumb.label}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
