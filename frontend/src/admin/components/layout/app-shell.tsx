"use client";

import { ExternalLink, Menu as MenuIcon, Moon, Sun, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Dialog } from "radix-ui";
import { Suspense, useLayoutEffect, useState, type ReactNode } from "react";
import { Button } from "@/admin/components/ui/button";
import { IS_LOCAL_DEMO } from "@/admin/lib/content";
import { cn } from "@/admin/lib/cn";
import { NAV_GROUPS, WEBSITE_URL } from "./nav-items";
import { applyTheme, resolveTheme, type Theme } from "./theme";

function isActive(pathname: string, href: string) {
  return href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(`${href}/`);
}

function NavLinks({ pathname, onNavigate }: { pathname: string | null; onNavigate?: () => void }) {
  return (
    <nav aria-label="Admin" className="flex-1 space-y-6 overflow-y-auto px-3">
      {NAV_GROUPS.map((group) => (
        <div key={group.label}>
          <p className="px-3 pb-2 text-[0.65rem] font-bold tracking-[0.14em] text-sidebar-muted uppercase">
            {group.label}
          </p>
          <ul className="space-y-0.5">
            {group.items.map(({ href, label, icon: Icon }) => {
              const active = pathname !== null && isActive(pathname, href);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      active
                        ? "bg-sidebar-active text-white"
                        : "text-sidebar-muted hover:bg-sidebar-active/60 hover:text-sidebar-foreground",
                    )}
                  >
                    <Icon
                      aria-hidden="true"
                      className={cn("size-4 shrink-0", active ? "text-primary" : "text-sidebar-muted group-hover:text-sidebar-foreground")}
                    />
                    {label}
                    {active && <span aria-hidden="true" className="ms-auto h-4 w-0.5 rounded-full bg-primary" />}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function CurrentNavLinks({ onNavigate }: { onNavigate?: () => void }) {
  return <NavLinks pathname={usePathname()} onNavigate={onNavigate} />;
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <Link href="/admin" onClick={onNavigate} className="flex items-center gap-3 px-5 pt-6 pb-7">
        <span className="relative size-9 overflow-hidden rounded-md border border-white/10">
          <Image src="/images/logo.jpg" alt="" fill sizes="36px" className="object-cover" priority />
        </span>
        <span className="leading-tight">
          <span className="block font-display text-[1.05rem] font-medium tracking-wide">Driveo</span>
          <span className="block text-[0.65rem] font-semibold tracking-[0.18em] text-sidebar-muted uppercase">
            Admin
          </span>
        </span>
      </Link>

      {/* The active item depends on the URL, which isn't known while prerendering. */}
      <Suspense fallback={<NavLinks pathname={null} onNavigate={onNavigate} />}>
        <CurrentNavLinks onNavigate={onNavigate} />
      </Suspense>

      <div className="space-y-3 p-4">
        {IS_LOCAL_DEMO && (
          <div className="rounded-lg border border-white/10 bg-white/[0.04] p-3">
            <p className="text-xs font-semibold text-sidebar-foreground">Demo mode</p>
            <p className="mt-1 text-[0.7rem] leading-relaxed text-sidebar-muted">
              Changes are saved in this browser only. They reach the website once the admin is connected to
              the Driveo API.
            </p>
          </div>
        )}
        <a
          href={WEBSITE_URL}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-sidebar-muted transition-colors hover:bg-sidebar-active/60 hover:text-sidebar-foreground"
        >
          <ExternalLink aria-hidden="true" className="size-3.5" />
          View website
        </a>
      </div>
    </div>
  );
}

function ThemeToggle() {
  const [theme, setTheme] = useState<Theme | null>(null);

  // The real theme is only known in the browser. The inline script sets it before paint;
  // re-apply it here too, because React's dev remount resets the <html> class.
  useLayoutEffect(() => {
    const current = resolveTheme();
    document.documentElement.classList.toggle("dark", current === "dark");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(current);
  }, []);

  const next: Theme = theme === "dark" ? "light" : "dark";
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={`Switch to ${next} mode`}
      title={`Switch to ${next} mode`}
      onClick={() => {
        applyTheme(next);
        setTheme(next);
      }}
    >
      {theme === "dark" ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
    </Button>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="min-h-svh lg:grid lg:grid-cols-[16rem_1fr]">
      <aside className="sticky top-0 hidden h-svh lg:block">
        <SidebarContent />
      </aside>

      <Dialog.Root open={drawerOpen} onOpenChange={setDrawerOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-40 bg-black/50 lg:hidden" />
          <Dialog.Content className="fixed inset-y-0 start-0 z-50 w-72 shadow-pop lg:hidden">
            <Dialog.Title className="sr-only">Navigation</Dialog.Title>
            <Dialog.Description className="sr-only">Admin sections</Dialog.Description>
            <SidebarContent onNavigate={() => setDrawerOpen(false)} />
            <Dialog.Close asChild>
              <button
                type="button"
                aria-label="Close navigation"
                className="absolute top-5 end-3 grid size-8 cursor-pointer place-items-center rounded-md text-sidebar-muted hover:bg-sidebar-active hover:text-white"
              >
                <X aria-hidden="true" className="size-4" />
              </button>
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <div className="flex min-w-0 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-border bg-background/85 px-4 backdrop-blur-md sm:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label="Open navigation"
            onClick={() => setDrawerOpen(true)}
          >
            <MenuIcon aria-hidden="true" />
          </Button>
          <span className="font-display text-base font-medium lg:hidden">Driveo Admin</span>
          <div className="ms-auto flex items-center gap-1">
            {IS_LOCAL_DEMO && (
              <span className="me-2 hidden items-center gap-1.5 rounded-full border border-warning/30 bg-warning-soft px-2.5 py-1 text-xs font-semibold text-warning sm:inline-flex">
                <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
                Demo data · saved in this browser
              </span>
            )}
            <ThemeToggle />
          </div>
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
