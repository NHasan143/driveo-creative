"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { localePath, type Locale } from "@/i18n/config";

interface CookieBannerProps {
  locale: Locale;
  policyLabel: string;
}

const COPY: Record<Locale, { text: string; accept: string; essential: string }> = {
  en: {
    text: "We use essential cookies to maintain security and your language preferences. Non-essential analytics run only with your consent.",
    accept: "Accept All",
    essential: "Essential Only",
  },
  fr: {
    text: "Nous utilisons des cookies essentiels pour la sécurité et vos préférences. Les analyses s'exécutent uniquement avec votre accord.",
    accept: "Tout accepter",
    essential: "Essentiels uniquement",
  },
  bg: {
    text: "Използваме необходими бисквитки за сигурност и езикови настройки. Аналитични инструменти се активират само с ваше съгласие.",
    accept: "Приемам всички",
    essential: "Само необходими",
  },
  ar: {
    text: "نستخدم ملفات تعريف الارتباط الأساسية للحفاظ على الأمان وإعداداتكم. لا يتم تفعيل أي تحليلات إلا بموافقتكم.",
    accept: "قبول الكل",
    essential: "الضرورية فقط",
  },
};

const STORAGE_KEY = "driveo_cookie_consent";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getSnapshot() {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return "essential";
  }
}

function getServerSnapshot() {
  return "essential";
}

export function CookieBanner({ locale, policyLabel }: CookieBannerProps) {
  const consent = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [dismissed, setDismissed] = useState(false);

  if (consent || dismissed) return null;

  const content = COPY[locale] ?? COPY.en;

  const handleConsent = (choice: "all" | "essential") => {
    try {
      localStorage.setItem(STORAGE_KEY, choice);
    } catch {
      // Storage unavailable
    }
    setDismissed(true);
  };

  return (
    <aside
      role="region"
      aria-label="Cookie Consent"
      className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-2xl rounded-lg border border-border/80 bg-background/95 p-5 shadow-2xl backdrop-blur-md transition-all duration-300 sm:bottom-6 sm:p-6"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
          {content.text}{" "}
          <Link
            href={localePath(locale, "/cookies")}
            className="text-foreground underline decoration-primary underline-offset-4 transition-colors hover:text-primary"
          >
            {policyLabel}
          </Link>
        </p>

        <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
          <button
            type="button"
            onClick={() => handleConsent("essential")}
            className="rounded border border-border bg-secondary/80 px-3.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-secondary"
          >
            {content.essential}
          </button>
          <button
            type="button"
            onClick={() => handleConsent("all")}
            className="rounded border border-primary bg-primary px-3.5 py-1.5 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            {content.accept}
          </button>
        </div>
      </div>
    </aside>
  );
}
