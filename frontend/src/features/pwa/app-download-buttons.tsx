"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { AndroidIcon, AppleIcon } from "@/components/icons/design-icons";
import type { Dictionary } from "@/i18n/get-dictionary";
import { cn } from "@/lib/cn";
import styles from "./install-app-button.module.css";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

interface AppDownloadButtonsProps {
  labels: { ios: string; android: string; androidHelp: string };
  install: Dictionary["install"];
  className?: string;
}

const pill =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 text-[0.8125rem] leading-none font-medium tracking-[-0.03em] text-ink transition-[transform,filter] duration-200 hover:-translate-y-px xl:px-6 xl:text-[0.9375rem]";

/**
 * "Download iOS" and "Download Android". Driveo installs from the browser as an
 * app (PWA): Chromium browsers show their install prompt; otherwise a short note
 * explains how to add Driveo to the home screen.
 */
export function AppDownloadButtons({ labels, install, className }: AppDownloadButtonsProps) {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [help, setHelp] = useState<"ios" | "android" | null>(null);

  useEffect(() => {
    const onPrompt = (event: Event) => {
      event.preventDefault();
      setPromptEvent(event as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  async function open(platform: "ios" | "android") {
    if (platform === "android" && promptEvent) {
      await promptEvent.prompt();
      await promptEvent.userChoice;
      setPromptEvent(null);
      return;
    }
    setHelp(platform);
  }

  return (
    <>
      <div className={cn("flex flex-wrap items-center gap-2.5 xl:gap-4", className)}>
        <button type="button" className={cn(pill, "bg-white")} onClick={() => open("ios")}>
          <AppleIcon className="h-[1.0625rem] w-3.5 shrink-0" />
          {labels.ios}
        </button>
        <button type="button" className={cn(pill, "bg-gold hover:brightness-105")} onClick={() => open("android")}>
          <AndroidIcon className="size-4 shrink-0" />
          {labels.android}
        </button>
      </div>

      {help && (
        <div
          className={styles.modal}
          role="dialog"
          aria-modal="true"
          aria-label={install.iosTitle}
          onClick={(event) => event.target === event.currentTarget && setHelp(null)}
          onKeyDown={(event) => event.key === "Escape" && setHelp(null)}
        >
          <div className={styles.content}>
            <button type="button" className={styles.close} onClick={() => setHelp(null)} aria-label={install.close} autoFocus>
              <X aria-hidden="true" />
            </button>
            <h3>{install.iosTitle}</h3>
            <p>{help === "ios" ? install.iosBody : labels.androidHelp}</p>
          </div>
        </div>
      )}
    </>
  );
}
