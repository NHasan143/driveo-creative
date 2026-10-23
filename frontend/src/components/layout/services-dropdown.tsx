"use client";

import { ArrowUpRight, ChevronDown, Clock3, Plane, Route, Sparkles } from "lucide-react";
import Link from "next/link";
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { SERVICE_TYPES } from "@/domain/booking";
import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { cn } from "@/lib/cn";
import styles from "./services-dropdown.module.css";

interface ServicesDropdownProps {
  locale: Locale;
  label: string;
  items: Dictionary["services"]["items"];
  allServices: string;
  current: boolean;
  className?: string;
}

const icons = { airport_transfer: Plane, point_to_point: Route, hourly_hire: Clock3, private_event: Sparkles };

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
    const breakpoint = window.matchMedia("(min-width: 1024px)");
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
    const last = SERVICE_TYPES.length;
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
          {SERVICE_TYPES.map((type, index) => {
            const Icon = icons[type];
            return (
              <li key={type}>
                <Link
                  ref={(element) => { linksRef.current[index] = element; }}
                  href={`${localePath(locale, "/services")}#${type}`}
                  className={styles.option}
                  onClick={() => setOpen(false)}
                >
                  <Icon aria-hidden="true" className={styles.icon} />
                  <span>{items[type].title}</span>
                </Link>
              </li>
            );
          })}
        </ul>
        <Link
          ref={(element) => { linksRef.current[SERVICE_TYPES.length] = element; }}
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
