"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useState, type ComponentType, type FormEvent, type ReactNode, type SVGProps } from "react";
import {
  ArrowRightIcon,
  CalendarBlankIcon,
  CaretDownIcon,
  CarIcon,
  ClockIcon,
  HourglassLowIcon,
  MapPinIcon,
} from "@/components/icons/design-icons";
import { HIRE_HOURS, type City, type ServiceType } from "@/domain/booking";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { cn } from "@/lib/cn";
import { bookHref } from "../book-link";

interface BookingBarProps {
  locale: Locale;
  labels: Dictionary["site"]["bookingBar"];
  /** The page's service, e.g. on a service page; "Hourly" always means hourly hire. */
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

type Icon = ComponentType<SVGProps<SVGSVGElement>>;

function Field({ label, htmlFor, children, className }: { label: string; htmlFor: string; children: ReactNode; className?: string }) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-2.5 xl:gap-3", className)}>
      <label htmlFor={htmlFor} className="text-xs leading-[1.2] font-semibold tracking-[-0.01em] text-cream-border xl:text-[0.9375rem]">
        {label}
      </label>
      {children}
    </div>
  );
}

const boxClass =
  "relative flex h-10 items-center rounded-lg border border-white/14 bg-[#272521] text-white focus-within:border-amber/70";
const inputClass =
  "h-full w-full min-w-0 appearance-none border-0 bg-transparent px-2.5 text-xs leading-[1.2] font-medium tracking-[-0.01em] text-white placeholder:text-[#8c8b89] focus:outline-none xl:text-sm [color-scheme:dark]";
/* Native date and time pickers stay usable but invisible, over the design's own icon. */
const pickerClass =
  "pe-8 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-y-0 [&::-webkit-calendar-picker-indicator]:end-0 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:w-9 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0";

function EndIcon({ icon: Glyph }: { icon: Icon }) {
  return <Glyph aria-hidden="true" className="pointer-events-none absolute end-2.5 size-3.5 text-amber" />;
}

/** The hero search on a dark glass panel: one way or hourly, pickup, date and time, then on to the booking page. */
export function BookingBar({ locale, labels, service, city, className }: BookingBarProps) {
  const router = useRouter();
  const id = useId();
  const [hourly, setHourly] = useState(service === "hourly_hire");
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
      "inline-flex h-8 items-center gap-1 rounded-full px-3 text-xs leading-[1.2] font-medium tracking-[-0.03em] transition-colors xl:h-10 xl:px-4 xl:text-[0.9375rem]",
      active ? "bg-amber text-ink" : "border border-white/33 text-cream-border hover:border-white/60",
    );

  return (
    <form
      onSubmit={handleSubmit}
      aria-label={labels.label}
      className={cn(
        "flex w-full flex-col items-center gap-6 rounded-2xl text-start border border-white/12 bg-[rgba(31,26,20,0.6)] p-3 backdrop-blur-md xl:gap-8 xl:p-6",
        className,
      )}
    >
      <div role="group" aria-label={labels.label} className="flex items-center gap-2.5 xl:gap-3.5">
        <button type="button" aria-pressed={!hourly} className={tab(!hourly)} onClick={() => setHourly(false)}>
          <CarIcon aria-hidden="true" className="size-3.5 xl:size-4" />
          {labels.oneWay}
        </button>
        <button type="button" aria-pressed={hourly} className={tab(hourly)} onClick={() => setHourly(true)}>
          <HourglassLowIcon aria-hidden="true" className="size-3.5 xl:size-4" />
          {labels.hourly}
        </button>
      </div>

      <div className="grid w-full grid-cols-2 gap-x-3 gap-y-4 xl:flex xl:items-end xl:gap-5">
        <Field label={labels.pickup} htmlFor={`${id}-pickup`} className="col-span-2 xl:min-w-[13.75rem] xl:flex-1">
          <div className={boxClass}>
            <MapPinIcon aria-hidden="true" className="pointer-events-none ms-3 size-3.5 shrink-0 text-amber" />
            <input
              id={`${id}-pickup`}
              name="pickup"
              required
              minLength={2}
              maxLength={300}
              autoComplete="off"
              placeholder={labels.pickupPlaceholder}
              className={cn(inputClass, "ps-1.5")}
            />
          </div>
        </Field>

        {hourly ? (
          <Field label={labels.duration} htmlFor={`${id}-hours`} className="col-span-2 xl:w-[10.9375rem] xl:shrink-0">
            <div className={boxClass}>
              <select id={`${id}-hours`} name="hours" defaultValue={HIRE_HOURS.min} className={cn(inputClass, "pe-8")}>
                {HOUR_OPTIONS.map((hours) => (
                  <option key={hours} value={hours} className="bg-ink">
                    {labels.hours.replace("{count}", String(hours))}
                  </option>
                ))}
              </select>
              <EndIcon icon={CaretDownIcon} />
            </div>
          </Field>
        ) : (
          <Field label={labels.dropoff} htmlFor={`${id}-dropoff`} className="col-span-2 xl:min-w-[13.75rem] xl:flex-1">
            <div className={boxClass}>
              <MapPinIcon aria-hidden="true" className="pointer-events-none ms-3 size-3.5 shrink-0 text-amber" />
              <input
                id={`${id}-dropoff`}
                name="dropoff"
                required
                minLength={2}
                maxLength={300}
                autoComplete="off"
                placeholder={labels.dropoffPlaceholder}
                className={cn(inputClass, "ps-1.5")}
              />
            </div>
          </Field>
        )}

        <Field label={labels.date} htmlFor={`${id}-date`} className="xl:w-40 xl:shrink-0">
          <div className={boxClass}>
            <input id={`${id}-date`} name="date" type="date" required min={minDate} className={cn(inputClass, pickerClass)} />
            <EndIcon icon={CalendarBlankIcon} />
          </div>
        </Field>

        <Field label={labels.time} htmlFor={`${id}-time`} className="xl:w-40 xl:shrink-0">
          <div className={boxClass}>
            <input id={`${id}-time`} name="time" type="time" required className={cn(inputClass, pickerClass)} />
            <EndIcon icon={ClockIcon} />
          </div>
        </Field>

        <button
          type="submit"
          className="col-span-2 mt-1 inline-flex h-12 items-center justify-center gap-2.5 rounded-full bg-gold px-5 text-[0.9375rem] leading-[1.2] font-medium tracking-[-0.01em] text-ink transition-[filter,transform] hover:-translate-y-px hover:brightness-105 xl:mt-0 xl:h-10 xl:shrink-0"
        >
          {labels.submit}
          <ArrowRightIcon aria-hidden="true" className="size-3.5 rtl:-scale-x-100" />
        </button>
      </div>
    </form>
  );
}
