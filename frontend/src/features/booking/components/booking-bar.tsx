"use client";

import { ArrowRight, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useId, useState, type FormEvent, type ReactNode } from "react";
import { CITIES, HIRE_HOURS, type City, type ServiceType } from "@/domain/booking";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { cn } from "@/lib/cn";
import { bookHref } from "../book-link";

interface BookingBarProps {
  locale: Locale;
  labels: Dictionary["bookingBar"];
  hoursUnit: string;
  cityNames: Dictionary["cities"]["names"];
  /** The page's service, e.g. on a service page; "By the hour" always means hourly hire. */
  service?: ServiceType | null;
  city?: City;
  className?: string;
}

const HOUR_OPTIONS = Array.from({ length: HIRE_HOURS.max - HIRE_HOURS.min + 1 }, (_, index) => HIRE_HOURS.min + index);

function todayIso() {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 10);
}

function Cell({ label, htmlFor, children, className }: { label: string; htmlFor: string; children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "relative flex min-w-0 flex-col justify-center gap-1 px-4 py-3 lg:border-e lg:border-border lg:last-of-type:border-e-0",
        className,
      )}
    >
      <label htmlFor={htmlFor} className="text-xs font-semibold text-foreground">
        {label}
      </label>
      {children}
    </div>
  );
}

const fieldClass =
  "w-full min-w-0 appearance-none border-0 bg-transparent p-0 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none [color-scheme:dark]";

/** The hero search: trip type, city, places, date and time, then on to the booking page. */
export function BookingBar({ locale, labels, hoursUnit, cityNames, service, city: presetCity, className }: BookingBarProps) {
  const router = useRouter();
  const id = useId();
  const [hourly, setHourly] = useState(service === "hourly_hire");
  const [city, setCity] = useState<City | "">(presetCity ?? "");
  const [minDate, setMinDate] = useState<string>();

  // "Today" must come from the visitor's clock, not the build server's.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMinDate(todayIso()), []);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const text = (name: string) => String(data.get(name) ?? "").trim();
    const oneWayService = service && service !== "hourly_hire" ? service : "";

    router.push(
      bookHref(locale, {
        service: hourly ? "hourly_hire" : oneWayService,
        city,
        pickup: text("pickup"),
        dropoff: hourly ? undefined : text("dropoff"),
        hours: hourly ? Number(data.get("hours")) : undefined,
        date: text("date"),
        time: text("time"),
      }),
    );
  }

  const tab = (active: boolean) =>
    cn(
      "min-h-9 rounded-full px-5 text-sm font-semibold transition-colors",
      active ? "bg-primary text-primary-foreground" : "text-foreground/85 hover:text-foreground",
    );

  return (
    <form onSubmit={handleSubmit} aria-label={labels.label} className={cn("w-full", className)}>
      <div role="group" aria-label={labels.label} className="mx-auto mb-4 flex w-fit gap-1 rounded-full border border-input bg-background/60 p-1 backdrop-blur-md">
        <button type="button" aria-pressed={!hourly} className={tab(!hourly)} onClick={() => setHourly(false)}>
          {labels.oneWay}
        </button>
        <button type="button" aria-pressed={hourly} className={tab(hourly)} onClick={() => setHourly(true)}>
          {labels.byTheHour}
        </button>
      </div>

      <div className="grid overflow-hidden rounded-2xl border border-input bg-background/75 shadow-[0_30px_80px_-20px_color-mix(in_oklab,var(--background)_80%,transparent)] backdrop-blur-xl sm:grid-cols-2 lg:grid-cols-[1fr_1.4fr_1.4fr_1fr_0.9fr_auto] lg:rounded-full lg:ps-3">
        <Cell label={labels.city} htmlFor={`${id}-city`} className="border-b border-border sm:border-e lg:border-b-0">
          <div className="relative">
            <select
              id={`${id}-city`}
              name="city"
              required
              value={city}
              onChange={(event) => setCity(event.target.value as City)}
              className={cn(fieldClass, "pe-5", !city && "text-muted-foreground")}
            >
              <option value="" disabled>
                {labels.cityPlaceholder}
              </option>
              {CITIES.map((option) => (
                <option key={option} value={option}>
                  {cityNames[option]}
                </option>
              ))}
            </select>
            <ChevronDown aria-hidden="true" className="pointer-events-none absolute end-0 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          </div>
        </Cell>

        <Cell label={labels.pickup} htmlFor={`${id}-pickup`} className="border-b border-border lg:border-b-0">
          <input
            id={`${id}-pickup`}
            name="pickup"
            required
            minLength={2}
            maxLength={300}
            autoComplete="off"
            placeholder={labels.pickupPlaceholder}
            className={fieldClass}
          />
        </Cell>

        {hourly ? (
          <Cell label={labels.duration} htmlFor={`${id}-hours`} className="border-b border-border sm:border-e lg:border-b-0">
            <div className="relative">
              <select id={`${id}-hours`} name="hours" defaultValue={HIRE_HOURS.min} className={cn(fieldClass, "pe-5")}>
                {HOUR_OPTIONS.map((hours) => (
                  <option key={hours} value={hours}>
                    {hours} {hoursUnit}
                  </option>
                ))}
              </select>
              <ChevronDown aria-hidden="true" className="pointer-events-none absolute end-0 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            </div>
          </Cell>
        ) : (
          <Cell label={labels.dropoff} htmlFor={`${id}-dropoff`} className="border-b border-border sm:border-e lg:border-b-0">
            <input
              id={`${id}-dropoff`}
              name="dropoff"
              required
              minLength={2}
              maxLength={300}
              autoComplete="off"
              placeholder={labels.dropoffPlaceholder}
              className={fieldClass}
            />
          </Cell>
        )}

        <Cell label={labels.date} htmlFor={`${id}-date`} className="border-b border-border lg:border-b-0">
          <input id={`${id}-date`} name="date" type="date" required min={minDate} className={fieldClass} />
        </Cell>

        <Cell label={labels.time} htmlFor={`${id}-time`} className="border-b border-border sm:border-e sm:border-b-0">
          <input id={`${id}-time`} name="time" type="time" required className={fieldClass} />
        </Cell>

        <div className="flex items-center p-3 lg:ps-1">
          <button
            type="submit"
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-accent lg:w-auto"
          >
            {labels.submit}
            <ArrowRight aria-hidden="true" className="size-4 rtl:-scale-x-100" />
          </button>
        </div>
      </div>
    </form>
  );
}
