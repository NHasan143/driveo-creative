"use client";

import { ArrowUpRight, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { serviceIcons } from "@/components/icons/service-icons";
import { localePath, type Locale } from "@/i18n/config";
import type { NavService } from "@/lib/content/site-services";
import { cn } from "@/lib/cn";
import styles from "./services-dropdown.module.css";

interface ServicesDropdownProps {
  locale: Locale;
  label: string;
  items: NavService[];
  allServices: string;
  current: boolean;
  className?: string;
}

export function ServicesDropdown({ locale, label, items, allServices, current, className }: ServicesDropdownProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const linksRef = useRef<(HTMLAnchorElement | null)[]>([]);
  const initialFocus = useRef<number | null>(null);
  const pointerType = useRef("mouse");
  const panelId = useId();
  const triggerId = useId();

  useEffect(() => {
    if (!open) return;
    if (initialFocus.current !== null) {
      linksRef.current[initialFocus.current]?.focus();
      initialFocus.current = null;
    }
    function dismiss(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    // The header has separate desktop and mobile navigation instances.
    // Matches the header's xl breakpoint, where the nav moves into the top row.
    const breakpoint = window.matchMedia("(min-width: 1280px)");
    function close() { setOpen(false); }
    document.addEventListener("pointerdown", dismiss);
    breakpoint.addEventListener("change", close);
    return () => {
      document.removeEventListener("pointerdown", dismiss);
      breakpoint.removeEventListener("change", close);
    };
  }, [open]);

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape" && open) {
      event.preventDefault();
      event.stopPropagation();
      setOpen(false);
      triggerRef.current?.focus();
      return;
    }
    const index = linksRef.current.indexOf(document.activeElement as HTMLAnchorElement);
    const last = items.length;
    let next: number | undefined;
    if (event.key === "ArrowDown") next = index < 0 ? 0 : (index + 1) % (last + 1);
    if (event.key === "ArrowUp") next = index < 0 ? last : (index + last) % (last + 1);
    if (open && event.key === "Home") next = 0;
    if (open && event.key === "End") next = last;
    if (next === undefined) return;
    event.preventDefault();
    if (open) linksRef.current[next]?.focus();
    else {
      initialFocus.current = next;
      setOpen(true);
    }
  }

  return (
    <div
      ref={rootRef}
      className={styles.root}
      data-open={open || undefined}
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") setOpen(true);
      }}
      onPointerLeave={(event) => {
        if (event.pointerType === "mouse" && !event.currentTarget.querySelector(":focus-visible")) {
          setOpen(false);
        }
      }}
      onPointerDown={(event) => { pointerType.current = event.pointerType; }}
      onKeyDown={handleKeyDown}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(false);
      }}
    >
      <button
        ref={triggerRef}
        id={triggerId}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        className={cn(className, styles.trigger, current && styles.current)}
        onClick={(event) => {
          // Mouse users hover; keyboard activation and touch still toggle.
          if (event.detail === 0 || pointerType.current !== "mouse") setOpen((value) => !value);
        }}
      >
        {label}
        <ChevronDown aria-hidden="true" className={styles.chevron} />
      </button>
      <div id={panelId} hidden={!open} className={styles.panel}>
        <ul aria-labelledby={triggerId} className={styles.list}>
          {items.map((service, index) => {
            const Icon = serviceIcons[service.icon];
            return (
              <li key={service.slug}>
                <Link
                  ref={(element) => { linksRef.current[index] = element; }}
                  href={localePath(locale, service.path)}
                  className={styles.option}
                  onClick={() => setOpen(false)}
                >
                  <Icon aria-hidden="true" className={styles.icon} />
                  <span>{service.title}</span>
                </Link>
              </li>
            );
          })}
        </ul>
        <Link
          ref={(element) => { linksRef.current[items.length] = element; }}
          href={localePath(locale, "/services")}
          aria-current={current ? "page" : undefined}
          className={styles.all}
          onClick={() => setOpen(false)}
        >
          <span>{allServices}</span>
          <ArrowUpRight aria-hidden="true" className={styles.icon} />
        </Link>
      </div>
    </div>
  );
}
