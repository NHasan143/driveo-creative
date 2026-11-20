"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import type { ServiceIcon } from "@/admin/lib/content/types";
import { ArrowRightIcon, CaretDownIcon } from "@/components/icons/design-icons";
import { serviceIcons } from "@/components/icons/service-icons";
import { cn } from "@/lib/cn";
import styles from "./nav-dropdown.module.css";

export interface NavDropdownItem {
  href: string;
  label: string;
  /** A service icon from the content admin's set. */
  icon?: ServiceIcon;
}

interface NavDropdownProps {
  label: string;
  items: NavDropdownItem[];
  /** A last, separated link, e.g. "All services". */
  footer?: NavDropdownItem;
  current?: boolean;
  className?: string;
}

/** A header menu ("Our Services", "For Business"): opens on hover, click, touch or the arrow keys. */
export function NavDropdown({ label, items, footer, current = false, className }: NavDropdownProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const linksRef = useRef<(HTMLAnchorElement | null)[]>([]);
  const initialFocus = useRef<number | null>(null);
  const pointerType = useRef("mouse");
  const panelId = useId();
  const triggerId = useId();
  const links = footer ? [...items, footer] : items;

  useEffect(() => {
    if (!open) return;
    if (initialFocus.current !== null) {
      linksRef.current[initialFocus.current]?.focus();
      initialFocus.current = null;
    }
    function dismiss(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    // Matches the header's xl breakpoint, where these menus live.
    const breakpoint = window.matchMedia("(min-width: 1280px)");
    function close() {
      setOpen(false);
    }
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
    const last = links.length - 1;
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
        if (event.pointerType === "mouse" && !event.currentTarget.querySelector(":focus-visible")) setOpen(false);
      }}
      onPointerDown={(event) => {
        pointerType.current = event.pointerType;
      }}
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
        <CaretDownIcon aria-hidden="true" className={styles.chevron} />
      </button>
      <div id={panelId} hidden={!open} className={styles.panel}>
        <ul aria-labelledby={triggerId} className={styles.list}>
          {items.map((item, index) => {
            const Icon = item.icon ? serviceIcons[item.icon] : null;
            return (
              <li key={item.href}>
                <Link
                  ref={(element) => {
                    linksRef.current[index] = element;
                  }}
                  href={item.href}
                  className={styles.option}
                  onClick={() => setOpen(false)}
                >
                  {Icon && <Icon aria-hidden="true" className={styles.icon} />}
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
        {footer && (
          <Link
            ref={(element) => {
              linksRef.current[items.length] = element;
            }}
            href={footer.href}
            className={styles.all}
            onClick={() => setOpen(false)}
          >
            <span>{footer.label}</span>
            <ArrowRightIcon aria-hidden="true" className={styles.arrow} />
          </Link>
        )}
      </div>
    </div>
  );
}
