"use client";

import { ArrowRight, Menu, UserRound, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { serviceIcons } from "@/components/icons/service-icons";
import { pagePath, SITE_PAGES } from "@/config/navigation";
import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import type { NavService } from "@/lib/content/site-services";

interface MobileMenuProps {
  locale: Locale;
  nav: Dictionary["nav"];
  services: NavService[];
  allServices: string;
}

/** The header's navigation below the xl breakpoint: a full-height panel behind a menu button. */
export function MobileMenu({ locale, nav, services, allServices }: MobileMenuProps) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = "hidden";
    closeRef.current?.focus();
    const button = buttonRef.current;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    // The panel is for small screens only; close it if the window grows past the breakpoint.
    const desktop = window.matchMedia("(min-width: 1280px)");
    function onResize() {
      if (desktop.matches) setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    desktop.addEventListener("change", onResize);
    return () => {
      root.style.overflow = previous;
      document.removeEventListener("keydown", onKeyDown);
      desktop.removeEventListener("change", onResize);
      button?.focus();
    };
  }, [open]);

  const close = () => setOpen(false);
  const linkClass = "flex min-h-12 items-center justify-between border-b border-border text-lg font-medium";

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        className="grid size-10 place-items-center rounded-full border border-input text-foreground transition-colors hover:border-primary hover:text-primary xl:hidden"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={nav.menu}
        onClick={() => setOpen(true)}
      >
        <Menu aria-hidden="true" className="size-5" />
      </button>

      {open && (
        <div
          id={panelId}
          role="dialog"
          aria-modal="true"
          aria-label={nav.menu}
          className="fixed inset-0 z-[60] flex flex-col overflow-y-auto bg-background xl:hidden"
        >
          <div className="site-shell flex h-[4.5rem] shrink-0 items-center justify-end">
            <button
              ref={closeRef}
              type="button"
              className="grid size-10 place-items-center rounded-full border border-input transition-colors hover:border-primary hover:text-primary"
              aria-label={nav.closeMenu}
              onClick={close}
            >
              <X aria-hidden="true" className="size-5" />
            </button>
          </div>

          <nav aria-label={nav.main} className="site-shell pb-10">
            <p className="mono-label mt-2 mb-1">{nav.services}</p>
            <ul>
              {services.map((service) => {
                const Icon = serviceIcons[service.icon];
                return (
                  <li key={service.slug}>
                    <Link href={localePath(locale, service.path)} className={linkClass} onClick={close}>
                      <span className="flex items-center gap-3">
                        <Icon aria-hidden="true" className="size-4 text-primary" strokeWidth={1.5} />
                        {service.title}
                      </span>
                      <ArrowRight aria-hidden="true" className="size-4 text-muted-foreground rtl:-scale-x-100" />
                    </Link>
                  </li>
                );
              })}
              <li>
                <Link href={localePath(locale, "/services")} className={`${linkClass} text-base text-muted-foreground`} onClick={close}>
                  {allServices}
                  <ArrowRight aria-hidden="true" className="size-4 rtl:-scale-x-100" />
                </Link>
              </li>
            </ul>

            <ul className="mt-8">
              {SITE_PAGES.filter(({ key }) => key !== "services").map(({ key, segment }) => (
                <li key={key}>
                  <Link href={localePath(locale, pagePath(segment))} className={linkClass} onClick={close}>
                    {nav[key]}
                    <ArrowRight aria-hidden="true" className="size-4 text-muted-foreground rtl:-scale-x-100" />
                  </Link>
                </li>
              ))}
              <li>
                <Link href={localePath(locale, "/account")} className={linkClass} onClick={close}>
                  <span className="flex items-center gap-3">
                    <UserRound aria-hidden="true" className="size-4 text-primary" />
                    {nav.account}
                  </span>
                  <ArrowRight aria-hidden="true" className="size-4 text-muted-foreground rtl:-scale-x-100" />
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </>
  );
}
