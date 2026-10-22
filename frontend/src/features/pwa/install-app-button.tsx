"use client";

import { Download, X } from "lucide-react";
import { useEffect, useState } from "react";
import type { Dictionary } from "@/i18n/get-dictionary";
import styles from "./install-app-button.module.css";

const DISMISSED_KEY = "driveo-install-dismissed";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function isIosSafari() {
  const ua = navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(ua) && /safari/.test(ua) && !/crios|chrome|fxios|firefox/.test(ua);
}

/**
 * Offers "Add to Home Screen": the native prompt on Chromium browsers, and
 * short manual instructions on iOS Safari, which has no install prompt API.
 */
export function InstallAppButton({ labels }: { labels: Dictionary["install"] }) {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [available, setAvailable] = useState(false);
  const [showIosHelp, setShowIosHelp] = useState(false);

  useEffect(() => {
    let dismissed = false;
    try {
      dismissed = localStorage.getItem(DISMISSED_KEY) === "1";
    } catch {
      // Storage can be blocked (private mode); treat as not dismissed.
    }
    if (dismissed || isStandalone()) return;

    // Browser-only checks: run after hydration so server and client markup match.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (isIosSafari()) setAvailable(true);

    const onPrompt = (event: Event) => {
      event.preventDefault();
      setPromptEvent(event as BeforeInstallPromptEvent);
      setAvailable(true);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  async function install() {
    if (!promptEvent) {
      setShowIosHelp(true);
      return;
    }
    await promptEvent.prompt();
    const { outcome } = await promptEvent.userChoice;
    if (outcome === "accepted") setAvailable(false);
  }

  function dismiss() {
    setShowIosHelp(false);
    setAvailable(false);
    try {
      localStorage.setItem(DISMISSED_KEY, "1");
    } catch {
      // Ignore: the button simply reappears next visit.
    }
  }

  if (!available) return null;

  return (
    <>
      <button type="button" className={styles.button} onClick={install} title={labels.label}>
        <Download aria-hidden="true" />
        <span>{labels.button}</span>
      </button>

      {showIosHelp && (
        <div
          className={styles.modal}
          role="dialog"
          aria-modal="true"
          aria-label={labels.iosTitle}
          onClick={(event) => event.target === event.currentTarget && dismiss()}
        >
          <div className={styles.content}>
            <button type="button" className={styles.close} onClick={dismiss} aria-label={labels.close}>
              <X aria-hidden="true" />
            </button>
            <h3>{labels.iosTitle}</h3>
            <p>{labels.iosBody}</p>
          </div>
        </div>
      )}
    </>
  );
}
