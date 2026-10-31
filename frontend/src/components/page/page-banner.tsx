import { ArrowDown, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { localePath, type Locale } from "@/i18n/config";
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
  /** Without an image the banner is a plain tinted band. */
  image?: string;
  /** Usually the booking bar. */
  children?: ReactNode;
  crumbs: Crumb[];
  /** "Explore more" link to the first section, `#content`. */
  explore?: string;
}

/** Inner-page hero: photo, centred title and the booking bar, with breadcrumbs underneath. */
export function PageBanner({ locale, title, intro, image, children, crumbs, explore }: PageBannerProps) {
  return (
    <>
      <section
        className={`relative isolate flex items-end overflow-hidden bg-secondary ${image ? "min-h-[78svh]" : "min-h-[44svh]"}`}
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
              className="absolute inset-0 -z-10 bg-[linear-gradient(to_bottom,color-mix(in_oklab,var(--background)_60%,transparent)_0%,color-mix(in_oklab,var(--background)_35%,transparent)_45%,var(--background)_100%)]"
            />
          </>
        )}
        <div className="site-shell pt-36 pb-10 sm:pb-14">
          <h1 className="mx-auto max-w-4xl text-center font-display text-[clamp(2.4rem,5.5vw,4.6rem)] leading-[1.04] font-medium text-balance">
            {title}
          </h1>
          {intro && (
            <p className="mx-auto mt-5 max-w-2xl text-center text-base leading-7 text-foreground/80 sm:text-lg">{intro}</p>
          )}
          {children && <div className="mx-auto mt-10 max-w-6xl">{children}</div>}
          {explore && (
            <a
              href="#content"
              className="mx-auto mt-8 flex w-fit items-center gap-2 text-sm font-semibold text-foreground/80 transition-colors hover:text-foreground"
            >
              {explore} <ArrowDown aria-hidden="true" className="size-4" />
            </a>
          )}
        </div>
      </section>

      <nav aria-label="Breadcrumb" className="site-shell py-6">
        <ol className="flex flex-wrap items-center justify-center gap-2 text-sm text-muted-foreground">
          {crumbs.map((crumb, index) => (
            <li key={crumb.label} className="flex items-center gap-2">
              {index > 0 && <ChevronRight aria-hidden="true" className="size-3.5 rtl:-scale-x-100" />}
              {crumb.path ? (
                <Link href={localePath(locale, crumb.path)} className="text-primary transition-colors hover:text-foreground">
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
