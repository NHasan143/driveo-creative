"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import { useSelectedLayoutSegment } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { BrandLogo } from "@/components/brand/brand-logo";
import { ArrowRightIcon, CaretDownIcon, CloseIcon } from "@/components/icons/design-icons";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { cn } from "@/lib/cn";
import { HeaderCta } from "./header-cta";
import { LanguageSwitcher } from "./language-switcher";
import type { NavDropdownItem } from "./nav-dropdown";

interface MenuGroup {
  label: string;
  items: NavDropdownItem[];
  footer: NavDropdownItem;
}

interface MenuLink {
  href: string;
  label: string;
}

export interface MobileMenuLinks {
  services: MenuGroup;
  business: MenuGroup;
  chauffeurs: MenuLink;
  about: MenuLink;
  contact: MenuLink;
}

interface MobileMenuProps {
  locale: Locale;
  nav: Dictionary["nav"];
  site: Dictionary["site"]["nav"];
  links: MobileMenuLinks;
}

const rowClass =
  "flex min-h-[4.5rem] w-full items-center gap-4 border-b border-cream-border text-start font-display text-[2rem] leading-tight font-medium tracking-[-0.015em]";

/** The header's navigation below the xl breakpoint: a full-screen sheet with large serif links. */
export function MobileMenu({ locale, nav, site, links }: MobileMenuProps) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<"services" | "business" | null>(null);
  const segment = useSelectedLayoutSegment();
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
  const currentTone = (active: boolean) => (active ? "text-amber-text" : "text-ink");

  function group(key: "services" | "business", active: boolean) {
    const { label, items, footer } = links[key];
    const isOpen = expanded === key;
    return (
      <li>
        <button
          type="button"
          aria-expanded={isOpen}
          className={cn(rowClass, currentTone(active))}
          onClick={() => setExpanded(isOpen ? null : key)}
        >
          <span className="flex-1">{label}</span>
          <CaretDownIcon className={cn("size-5 shrink-0 text-ink transition-transform", isOpen && "rotate-180")} />
        </button>
        {isOpen && (
          <ul className="border-b border-cream-border py-2">
            {[...items, footer].map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={close}
                  className="flex min-h-12 items-center justify-between gap-3 text-base font-medium tracking-[-0.01em] text-body"
                >
                  {item.label}
                  <ArrowRightIcon className="size-3.5 shrink-0 text-muted-text rtl:-scale-x-100" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </li>
    );
  }

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        className="-me-1.5 grid size-9 place-items-center text-current xl:hidden"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={nav.menu}
        onClick={() => setOpen(true)}
      >
        <Menu aria-hidden="true" className="size-6" strokeWidth={1.5} />
      </button>

      {open && (
        <div
          id={panelId}
          role="dialog"
          aria-modal="true"
          aria-label={nav.menu}
          className="fixed inset-0 z-[60] flex flex-col overflow-y-auto bg-white text-stone xl:hidden"
        >
          <div className="flex h-20 shrink-0 items-center justify-between px-6">
            <BrandLogo tone="dark" tagline={site.exclusive} />
            <div className="flex items-center gap-3.5">
              <LanguageSwitcher locale={locale} label={nav.language} />
              <HeaderCta locale={locale} requestQuote={site.requestQuote} signIn={site.signIn} account={nav.account} />
              <button
                ref={closeRef}
                type="button"
                className="-me-1.5 grid size-9 place-items-center text-ink"
                aria-label={nav.closeMenu}
                onClick={close}
              >
                <CloseIcon className="size-5" />
              </button>
            </div>
          </div>

          <nav aria-label={nav.main} className="px-5 pt-4 pb-12">
            <ul>
              {group("services", segment === "services")}
              {group("business", segment === "business")}
              <li>
                <Link href={links.chauffeurs.href} onClick={close} className={cn(rowClass, currentTone(segment === "chauffeurs"))}>
                  {links.chauffeurs.label}
                </Link>
              </li>
              <li>
                <Link href={links.about.href} onClick={close} className={cn(rowClass, "text-ink")}>
                  {links.about.label}
                </Link>
              </li>
              <li>
                <a href={links.contact.href} onClick={close} className={cn(rowClass, "text-ink")}>
                  {links.contact.label}
                </a>
              </li>
            </ul>
          </nav>

          <div className="mt-auto flex flex-col gap-6 px-5 py-8" style={{ backgroundImage: "linear-gradient(125deg, #f5aa89 20%, #fce1d5 38%, #e8e8e8 79%)" }}>
            <p className="text-[0.9375rem] font-semibold text-muted-text">{site.support}</p>
            <a
              href={links.contact.href}
              onClick={close}
              className="flex h-12 items-center justify-center rounded-full bg-ink px-6 text-[0.9375rem] font-medium text-white"
            >
              {site.contactUs}
            </a>
          </div>
        </div>
      )}
    </>
  );
}
