"use client";

import { Check, ChevronDown, Globe } from "lucide-react";
import Link from "next/link";
import { useSelectedLayoutSegment } from "next/navigation";
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { pagePath } from "@/config/navigation";
import {
  LOCALE_COOKIE,
  LOCALE_COOKIE_MAX_AGE,
  localeMeta,
  localePath,
  locales,
  type Locale,
} from "@/i18n/config";
import styles from "./language-switcher.module.css";

interface LanguageSwitcherProps {
  locale: Locale;
  label: string;
}

function rememberLocale(locale: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=${LOCALE_COOKIE_MAX_AGE}; samesite=lax`;
}

export function LanguageSwitcher({ locale, label }: LanguageSwitcherProps) {
  // Stay on the same page when switching language (segment, not URL: see MainNav).
  const currentPath = pagePath(useSelectedLayoutSegment());
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const menuId = useId();

  // Close on outside click and on Escape.
  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  // Focus the active language when the menu opens.
  useEffect(() => {
    if (open) optionRefs.current[locales.indexOf(locale)]?.focus();
  }, [open, locale]);

  function focusOption(index: number) {
    const count = locales.length;
    optionRefs.current[(index + count) % count]?.focus();
  }

  function handleMenuKeyDown(event: KeyboardEvent<HTMLUListElement>) {
    const current = optionRefs.current.indexOf(document.activeElement as HTMLAnchorElement);
    const moves: Record<string, number> = {
      ArrowDown: current + 1,
      ArrowUp: current - 1,
      Home: 0,
      End: locales.length - 1,
    };
    if (event.key in moves) {
      event.preventDefault();
      focusOption(moves[event.key]);
    } else if (event.key === "Tab") {
      setOpen(false);
    }
  }

  function handleTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      setOpen(true);
    }
  }

  return (
    <div ref={rootRef} className={styles.root}>
      <button
        ref={triggerRef}
        type="button"
        className={styles.trigger}
        aria-label={`${label}: ${localeMeta[locale].label}`}
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
        onKeyDown={handleTriggerKeyDown}
      >
        <Globe aria-hidden="true" />
        <span className={styles.full} lang={locale}>
          {localeMeta[locale].label}
        </span>
        <span className={styles.short}>{localeMeta[locale].short}</span>
        <ChevronDown aria-hidden="true" className={styles.chevron} data-open={open || undefined} />
      </button>

      <ul
        id={menuId}
        className={styles.menu}
        hidden={!open}
        aria-label={label}
        onKeyDown={handleMenuKeyDown}
      >
        {locales.map((code, index) => {
          const active = code === locale;
          return (
            <li key={code}>
              <Link
                ref={(element) => {
                  optionRefs.current[index] = element;
                }}
                href={localePath(code, currentPath)}
                hrefLang={code}
                lang={code}
                dir={localeMeta[code].dir}
                scroll={false}
                className={styles.option}
                aria-current={active ? "true" : undefined}
                onClick={() => {
                  rememberLocale(code);
                  setOpen(false);
                }}
              >
                <span>{localeMeta[code].label}</span>
                {active && <Check aria-hidden="true" />}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
