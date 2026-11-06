import { ArrowRight, Calendar, MapPin } from "lucide-react";
import { BrandMark } from "@/components/brand/brand-mark";
import { InstallAppButton } from "@/features/pwa/install-app-button";
import type { Dictionary } from "@/i18n/get-dictionary";

interface AppSectionProps {
  home: Dictionary["home"];
  install: Dictionary["install"];
  bookingBar: Dictionary["bookingBar"];
}

/** "Driveo on your phone": the home-screen app (PWA) beside a drawn phone showing the booking screen. */
export function AppSection({ home, install, bookingBar }: AppSectionProps) {
  const row = "flex items-center gap-3 rounded-xl border border-border bg-card px-3 py-3 text-xs";

  return (
    <section className="py-24 sm:py-32">
      <div className="site-shell grid items-center gap-14 lg:grid-cols-2">
        <div>
          <h2 className="font-display text-[clamp(2.4rem,5vw,4rem)] leading-[1.05] font-medium text-balance">{home.appTitle}</h2>
          <p className="mt-5 max-w-lg text-base leading-7 text-muted-foreground">{home.appCopy}</p>
          <div className="mt-8">
            <InstallAppButton labels={install} />
          </div>
        </div>

        <div aria-hidden="true" className="flex justify-center">
          <div className="w-64 rounded-[2.6rem] border border-input bg-background p-3 shadow-[0_40px_90px_-30px_color-mix(in_oklab,var(--primary)_35%,transparent)] sm:w-72">
            <div className="rounded-[2rem] bg-secondary px-4 pt-6 pb-8">
              <div className="mx-auto mb-6 h-1.5 w-16 rounded-full bg-muted" />
              <div className="flex items-center gap-2">
                <BrandMark />
                <span className="font-display text-sm">Driveo</span>
              </div>
              <p className="mt-6 font-display text-xl leading-tight">{bookingBar.label}</p>
              <div className="mt-5 grid gap-2">
                <div className={row}>
                  <MapPin className="size-4 text-primary" />
                  <span className="text-muted-foreground">{bookingBar.pickup}</span>
                </div>
                <div className={row}>
                  <MapPin className="size-4 text-primary" />
                  <span className="text-muted-foreground">{bookingBar.dropoff}</span>
                </div>
                <div className={row}>
                  <Calendar className="size-4 text-primary" />
                  <span className="text-muted-foreground">
                    {bookingBar.date} · {bookingBar.time}
                  </span>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-center gap-2 rounded-full bg-primary py-3 text-xs font-semibold text-primary-foreground">
                {bookingBar.submit}
                <ArrowRight className="size-3.5 rtl:-scale-x-100" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
