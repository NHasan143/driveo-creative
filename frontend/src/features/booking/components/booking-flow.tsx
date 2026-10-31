"use client";

import { ArrowLeft, ArrowRight, Briefcase, Check, LoaderCircle, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { buttonClassName } from "@/components/ui/button";
import { useAccount } from "@/features/account";
import {
  CITIES,
  FLEET_VEHICLES,
  getVehicleCapacity,
  HIRE_HOURS,
  SERVICE_TYPES,
  type City,
  type FleetVehicle,
  type ServiceType,
} from "@/domain/booking";
import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { cn } from "@/lib/cn";
import type { ServicePrices } from "@/lib/content/site-services";
import { formatPrice } from "@/lib/format-price";
import { isRemoteImage } from "@/lib/remote-image";
import { manageBookingHref } from "../book-link";
import { useBookingSubmission } from "../hooks/use-booking-submission";
import { FlowField, FlowSelect, FlowStepper, inputClass } from "./flow-fields";

/** A car class as the booking page shows it. */
export interface FlowVehicle {
  key: FleetVehicle;
  name: string;
  model: string;
  image: string;
}

export interface BookingFlowLabels {
  flow: Dictionary["bookFlow"];
  booking: Dictionary["booking"];
  bar: Dictionary["bookingBar"];
  pricing: Dictionary["pricing"];
  cityNames: Dictionary["cities"]["names"];
}

interface BookingFlowProps {
  locale: Locale;
  labels: BookingFlowLabels;
  prices: ServicePrices;
  vehicles: FlowVehicle[];
}

type Temperature = "" | "19°C" | "23°C";

interface Trip {
  service: ServiceType | "";
  city: City | "";
  pickup: string;
  dropoff: string;
  hours: number;
  date: string;
  time: string;
  vehicle: FleetVehicle | "";
  flightNumber: string;
  nameSign: string;
  passengers: number;
  luggage: number;
  quietRide: boolean;
  temperature: Temperature;
  notes: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  honeypot: string;
}

const HOUR_OPTIONS = Array.from({ length: HIRE_HOURS.max - HIRE_HOURS.min + 1 }, (_, index) => HIRE_HOURS.min + index);

function oneOf<T extends string>(options: readonly T[], value: string | null): T | "" {
  return options.includes(value as T) ? (value as T) : "";
}

/** The booking bar and "Book" links pass their choices in the query string; anything invalid is ignored. */
function tripFromQuery(query: URLSearchParams): Trip {
  const hours = Number(query.get("hours"));
  const date = query.get("date") ?? "";
  const time = query.get("time") ?? "";
  return {
    service: oneOf(SERVICE_TYPES, query.get("service")),
    city: oneOf(CITIES, query.get("city")),
    pickup: (query.get("pickup") ?? "").slice(0, 300),
    dropoff: (query.get("dropoff") ?? "").slice(0, 300),
    hours: Number.isInteger(hours) && hours >= HIRE_HOURS.min && hours <= HIRE_HOURS.max ? hours : HIRE_HOURS.min,
    date: /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : "",
    time: /^\d{2}:\d{2}$/.test(time) ? time : "",
    vehicle: oneOf(FLEET_VEHICLES, query.get("vehicle")),
    flightNumber: "",
    nameSign: "",
    passengers: 1,
    luggage: 0,
    quietRide: false,
    temperature: "",
    notes: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    honeypot: "",
  };
}

function todayIso() {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 10);
}

/** The price of a car for the trip, or undefined when the admin has not priced it. */
function priceFor(prices: ServicePrices, trip: Trip, vehicle: FleetVehicle) {
  if (!trip.service || !trip.city) return undefined;
  const grid = prices[trip.service];
  const unitPrice = grid?.amounts[`${trip.city}:${vehicle}`];
  if (!grid || unitPrice === undefined) return undefined;
  const hours = grid.unit === "hour" && trip.service === "hourly_hire" ? trip.hours : 1;
  return { total: unitPrice * hours, hourly: grid.unit === "hour", hours };
}

function SummaryRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border py-3 text-sm last:border-b-0">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-end font-medium">{children}</dd>
    </div>
  );
}

/** Choose a car class, add the details, review and book: Blacklane's booking flow, on Driveo's booking API. */
export function BookingFlow({ locale, labels, prices, vehicles }: BookingFlowProps) {
  const { flow, booking, bar, pricing, cityNames } = labels;
  const query = useSearchParams();
  const [trip, setTrip] = useState<Trip>(() => tripFromQuery(new URLSearchParams(query.toString())));
  const [step, setStep] = useState(0);
  const [minDate, setMinDate] = useState<string>();
  const { status, error, booking: created, submit, reset } = useBookingSubmission(locale);
  const { user } = useAccount();
  const [prefilledFor, setPrefilledFor] = useState<number | null>(null);

  // "Today" must come from the visitor's clock, not the build server's.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMinDate(todayIso()), []);

  // A signed-in customer's contact details are filled in once, without overwriting what they typed.
  if (user && prefilledFor !== user.id) {
    setPrefilledFor(user.id);
    setTrip((current) => ({
      ...current,
      firstName: current.firstName || user.first_name || "",
      lastName: current.lastName || user.last_name || "",
      email: current.email || user.email || "",
      phone: current.phone || user.phone || "",
    }));
  }

  const update = (changes: Partial<Trip>) => setTrip((current) => ({ ...current, ...changes }));
  const isHourly = trip.service === "hourly_hire";
  const isAirport = trip.service === "airport_transfer";
  const capacity = getVehicleCapacity(trip.vehicle);
  const passengers = Math.min(trip.passengers, capacity.passengers);
  const luggage = Math.min(trip.luggage, capacity.luggage);
  const chosen = trip.vehicle ? priceFor(prices, trip, trip.vehicle) : undefined;
  const vehicleName = vehicles.find((vehicle) => vehicle.key === trip.vehicle)?.name ?? "";
  const stepperLabels = { increase: booking.increase, decrease: booking.decrease, max: booking.max };

  function priceText(price: NonNullable<ReturnType<typeof priceFor>>) {
    return price.hourly && isHourly
      ? pricing.hoursTotal.replace("{price}", formatPrice(price.total, locale)).replace("{hours}", String(price.hours))
      : price.hourly
        ? `${formatPrice(price.total, locale)} ${pricing.perHour}`
        : formatPrice(price.total, locale);
  }

  function goTo(next: number) {
    setStep(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function nextStep(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!event.currentTarget.reportValidity()) return;
    if (step === 0 && !chosen) return;
    goTo(step + 1);
  }

  async function book() {
    const extras: string[] = [];
    if (trip.nameSign.trim()) extras.push(`${booking.nameSign}: ${trip.nameSign.trim()}`);
    if (trip.quietRide) extras.push(booking.quietRide);
    if (trip.temperature) extras.push(`${booking.cabinTemperature}: ${trip.temperature}`);
    const notes = [extras.length > 0 ? `[${extras.join(" · ")}]` : "", trip.notes.trim()].filter(Boolean).join("\n\n");

    await submit({
      firstName: trip.firstName,
      lastName: trip.lastName,
      email: trip.email,
      phone: trip.phone,
      city: trip.city as City,
      service: trip.service as ServiceType,
      vehicle: trip.vehicle as FleetVehicle,
      pickupLocation: trip.pickup,
      destination: isHourly ? "" : trip.dropoff,
      hireHours: isHourly ? trip.hours : null,
      flightNumber: isAirport ? trip.flightNumber : "",
      journeyDate: trip.date,
      journeyTime: trip.time,
      passengers,
      luggage,
      notes,
      honeypot: trip.honeypot,
    });
  }

  if (status === "sent" && created) {
    const total = created.total_price ? formatPrice(Number(created.total_price), locale) : null;
    return (
      <div className="mx-auto max-w-2xl rounded-3xl border border-border bg-card p-8 text-center sm:p-12" role="status">
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-primary text-primary-foreground">
          <Check aria-hidden="true" className="size-6" />
        </span>
        <p className="mt-6 text-sm text-muted-foreground">{booking.successEyebrow}</p>
        <h2 className="mt-2 font-display text-3xl font-medium sm:text-4xl">{booking.successTitle}</h2>
        <p className="mt-5 leading-7 text-muted-foreground">
          {booking.successReference} <strong dir="ltr" className="text-foreground">{created.reference}</strong>
          <br />
          {booking.successNext}
          {total && (
            <>
              <br />
              {booking.successPrice.replace("{price}", total)}
            </>
          )}
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link className={buttonClassName()} href={manageBookingHref(locale, created.reference, created.manage_token)}>
            {booking.manageLink}
          </Link>
          {user && (
            <Link className="text-sm underline underline-offset-4" href={localePath(locale, "/account")}>
              {booking.accountLink}
            </Link>
          )}
        </div>
        <button
          type="button"
          className="mt-6 text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
          onClick={() => {
            reset();
            setTrip(tripFromQuery(new URLSearchParams()));
            setStep(0);
          }}
        >
          {booking.again}
        </button>
      </div>
    );
  }

  const backButton = (
    <button
      type="button"
      onClick={() => goTo(step - 1)}
      className="inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
    >
      <ArrowLeft aria-hidden="true" className="size-4 rtl:-scale-x-100" />
      {flow.back}
    </button>
  );

  const card = "rounded-3xl border border-border bg-card p-5 sm:p-8";

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="min-w-0">
        <ol className="mb-8 flex gap-2" aria-label={flow.stepLabel.replace("{current}", String(step + 1)).replace("{total}", "3")}>
          {flow.steps.map((name, index) => (
            <li key={name} aria-current={index === step ? "step" : undefined} className="flex-1">
              <span className={cn("block h-1 rounded-full", index <= step ? "bg-primary" : "bg-muted")} />
              <span className={cn("mt-2 block text-xs font-semibold sm:text-sm", index === step ? "text-foreground" : "text-muted-foreground")}>
                {index + 1}. {name}
              </span>
            </li>
          ))}
        </ol>

        {step === 0 && (
          <form onSubmit={nextStep} className="grid gap-6">
            <section className={card} aria-labelledby="journey-title">
              <h2 id="journey-title" className="font-display text-2xl font-medium">
                {flow.journeyTitle}
              </h2>

              <fieldset className="mt-5">
                <legend className="text-sm font-semibold">{flow.journeyType}</legend>
                <div className="mt-3 flex flex-wrap gap-2">
                  {SERVICE_TYPES.map((type) => (
                    <label
                      key={type}
                      className="cursor-pointer rounded-full border border-input px-4 py-2 text-sm font-medium transition-colors hover:border-primary has-[:checked]:border-primary has-[:checked]:bg-primary has-[:checked]:text-primary-foreground has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring"
                    >
                      <input
                        type="radio"
                        name="service"
                        value={type}
                        required
                        checked={trip.service === type}
                        onChange={() => update({ service: type })}
                        className="sr-only"
                      />
                      {booking.serviceOptions[type]}
                    </label>
                  ))}
                </div>
              </fieldset>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <FlowField label={bar.city}>
                  <FlowSelect required value={trip.city} onChange={(event) => update({ city: event.target.value as City })}>
                    <option value="" disabled>
                      {bar.cityPlaceholder}
                    </option>
                    {CITIES.map((city) => (
                      <option key={city} value={city}>
                        {cityNames[city]}
                      </option>
                    ))}
                  </FlowSelect>
                </FlowField>
                <FlowField label={bar.pickup}>
                  <input
                    className={inputClass}
                    required
                    minLength={2}
                    maxLength={300}
                    placeholder={bar.pickupPlaceholder}
                    value={trip.pickup}
                    onChange={(event) => update({ pickup: event.target.value })}
                  />
                </FlowField>
                {isHourly ? (
                  <FlowField label={bar.duration} hint={booking.hourlyNote}>
                    <FlowSelect value={trip.hours} onChange={(event) => update({ hours: Number(event.target.value) })}>
                      {HOUR_OPTIONS.map((hours) => (
                        <option key={hours} value={hours}>
                          {hours} {booking.hoursUnit}
                        </option>
                      ))}
                    </FlowSelect>
                  </FlowField>
                ) : (
                  <FlowField label={bar.dropoff}>
                    <input
                      className={inputClass}
                      required
                      minLength={2}
                      maxLength={300}
                      placeholder={bar.dropoffPlaceholder}
                      value={trip.dropoff}
                      onChange={(event) => update({ dropoff: event.target.value })}
                    />
                  </FlowField>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <FlowField label={bar.date} hint={booking.dateHint}>
                    <input
                      className={inputClass}
                      type="date"
                      required
                      min={minDate}
                      value={trip.date}
                      onChange={(event) => update({ date: event.target.value })}
                    />
                  </FlowField>
                  <FlowField label={bar.time}>
                    <input
                      className={inputClass}
                      type="time"
                      required
                      value={trip.time}
                      onChange={(event) => update({ time: event.target.value })}
                    />
                  </FlowField>
                </div>
              </div>
            </section>

            <section aria-labelledby="class-title">
              <h2 id="class-title" className="font-display text-2xl font-medium">
                {flow.classTitle}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">{flow.classIntro}</p>

              <ul className="mt-5 grid gap-4">
                {vehicles.map((vehicle) => {
                  const price = priceFor(prices, trip, vehicle.key);
                  const known = Boolean(trip.service && trip.city);
                  const available = !known || price !== undefined;
                  const selected = trip.vehicle === vehicle.key;
                  const fits = getVehicleCapacity(vehicle.key);
                  return (
                    <li key={vehicle.key}>
                      <label
                        className={cn(
                          "grid cursor-pointer gap-4 rounded-3xl border bg-card p-4 transition-colors sm:grid-cols-[11rem_1fr_auto] sm:items-center sm:p-5",
                          selected ? "border-primary" : "border-border hover:border-input",
                          !available && "cursor-not-allowed opacity-60",
                        )}
                      >
                        <input
                          type="radio"
                          name="vehicle"
                          value={vehicle.key}
                          required
                          disabled={!available}
                          checked={selected}
                          onChange={() => update({ vehicle: vehicle.key })}
                          className="sr-only"
                        />
                        <span className="relative block aspect-[4/3] overflow-hidden rounded-2xl bg-muted">
                          <Image
                            src={vehicle.image}
                            alt=""
                            fill
                            sizes="11rem"
                            className="object-cover"
                            unoptimized={isRemoteImage(vehicle.image)}
                          />
                        </span>
                        <span className="min-w-0">
                          <span className="block font-display text-xl font-medium">{vehicle.name}</span>
                          <span className="block text-sm text-muted-foreground">{vehicle.model}</span>
                          <span className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted-foreground">
                            <span className="inline-flex items-center gap-1.5">
                              <Users aria-hidden="true" className="size-4" />
                              {flow.upToPassengers.replace("{count}", String(fits.passengers))}
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                              <Briefcase aria-hidden="true" className="size-4" />
                              {flow.upToLuggage.replace("{count}", String(fits.luggage))}
                            </span>
                          </span>
                        </span>
                        <span className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                          <span className="font-mono text-lg font-bold text-primary">
                            {price ? priceText(price) : known ? flow.notOffered : ""}
                          </span>
                          <span
                            className={cn(
                              "rounded-full px-4 py-2 text-sm font-semibold",
                              selected ? "bg-primary text-primary-foreground" : "border border-input",
                            )}
                          >
                            {selected ? flow.selected : flow.select}
                          </span>
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
              {trip.vehicle && trip.service && trip.city && !chosen && (
                <p role="alert" className="mt-4 text-sm text-destructive">
                  {booking.unavailable}
                </p>
              )}
            </section>

            <div className="flex justify-end">
              <button type="submit" className={buttonClassName({ size: "lg" })}>
                {flow.continue} <ArrowRight aria-hidden="true" className="rtl:-scale-x-100" />
              </button>
            </div>
          </form>
        )}

        {step === 1 && (
          <form onSubmit={nextStep} className="grid gap-6">
            <input
              className="absolute -start-[9999px] size-px opacity-0"
              name="website_hp"
              type="text"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              value={trip.honeypot}
              onChange={(event) => update({ honeypot: event.target.value })}
            />

            <section className={card} aria-labelledby="pickup-title">
              <h2 id="pickup-title" className="font-display text-2xl font-medium">
                {flow.pickupTitle}
              </h2>
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                {isAirport && (
                  <>
                    <FlowField label={booking.flightNumber}>
                      <input
                        className={inputClass}
                        maxLength={12}
                        pattern="[A-Za-z0-9 ]*"
                        dir="ltr"
                        placeholder={booking.flightNumberPlaceholder}
                        value={trip.flightNumber}
                        onChange={(event) => update({ flightNumber: event.target.value })}
                      />
                    </FlowField>
                    <FlowField label={booking.nameSign}>
                      <input
                        className={inputClass}
                        maxLength={80}
                        placeholder={booking.nameSignPlaceholder}
                        value={trip.nameSign}
                        onChange={(event) => update({ nameSign: event.target.value })}
                      />
                    </FlowField>
                  </>
                )}
                <FlowStepper
                  label={booking.passengers}
                  value={passengers}
                  min={1}
                  max={capacity.passengers}
                  onChange={(value) => update({ passengers: value })}
                  labels={stepperLabels}
                />
                <FlowStepper
                  label={booking.luggage}
                  value={luggage}
                  min={0}
                  max={capacity.luggage}
                  onChange={(value) => update({ luggage: value })}
                  labels={stepperLabels}
                />
                <fieldset className="grid gap-3 rounded-2xl border border-border p-4 sm:col-span-2">
                  <legend className="px-1 text-sm font-semibold">{booking.preferences}</legend>
                  <label className="flex cursor-pointer items-center gap-3 text-sm">
                    <input
                      type="checkbox"
                      className="size-4 accent-primary"
                      checked={trip.quietRide}
                      onChange={(event) => update({ quietRide: event.target.checked })}
                    />
                    {booking.quietRide}
                  </label>
                  <FlowField label={booking.cabinTemperature}>
                    <FlowSelect value={trip.temperature} onChange={(event) => update({ temperature: event.target.value as Temperature })}>
                      <option value="">{booking.tempStandard}</option>
                      <option value="19°C">{booking.tempCool}</option>
                      <option value="23°C">{booking.tempWarm}</option>
                    </FlowSelect>
                  </FlowField>
                </fieldset>
                <FlowField label={booking.notes} wide>
                  <textarea
                    className={cn(inputClass, "min-h-28 py-3")}
                    maxLength={1500}
                    rows={4}
                    placeholder={booking.notesPlaceholder}
                    value={trip.notes}
                    onChange={(event) => update({ notes: event.target.value })}
                  />
                </FlowField>
              </div>
            </section>

            <section className={card} aria-labelledby="contact-title">
              <h2 id="contact-title" className="font-display text-2xl font-medium">
                {flow.contactTitle}
              </h2>
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <FlowField label={booking.firstName}>
                  <input
                    className={inputClass}
                    autoComplete="given-name"
                    required
                    minLength={2}
                    maxLength={60}
                    placeholder={booking.firstNamePlaceholder}
                    value={trip.firstName}
                    onChange={(event) => update({ firstName: event.target.value })}
                  />
                </FlowField>
                <FlowField label={booking.lastName}>
                  <input
                    className={inputClass}
                    autoComplete="family-name"
                    required
                    maxLength={60}
                    placeholder={booking.lastNamePlaceholder}
                    value={trip.lastName}
                    onChange={(event) => update({ lastName: event.target.value })}
                  />
                </FlowField>
                <FlowField label={booking.email}>
                  <input
                    className={inputClass}
                    type="email"
                    autoComplete="email"
                    required
                    maxLength={254}
                    placeholder="you@example.com"
                    value={trip.email}
                    onChange={(event) => update({ email: event.target.value })}
                  />
                </FlowField>
                <FlowField label={booking.phone}>
                  <input
                    className={inputClass}
                    type="tel"
                    autoComplete="tel"
                    required
                    minLength={7}
                    maxLength={40}
                    pattern={String.raw`[\d+ \(\)\.\/\-]+`}
                    placeholder="+44"
                    dir="ltr"
                    value={trip.phone}
                    onChange={(event) => update({ phone: event.target.value })}
                  />
                </FlowField>
              </div>
              <p className="mt-5 text-xs leading-5 text-muted-foreground">{booking.privacy}</p>
            </section>

            <div className="flex items-center justify-between gap-4">
              {backButton}
              <button type="submit" className={buttonClassName({ size: "lg" })}>
                {flow.continue} <ArrowRight aria-hidden="true" className="rtl:-scale-x-100" />
              </button>
            </div>
          </form>
        )}

        {step === 2 && (
          <div className="grid gap-6">
            <section className={card} aria-labelledby="review-title">
              <h2 id="review-title" className="font-display text-2xl font-medium">
                {flow.reviewTitle}
              </h2>
              <dl className="mt-4">
                <SummaryRow label={`${booking.firstName} / ${booking.lastName}`}>
                  {trip.firstName} {trip.lastName}
                </SummaryRow>
                <SummaryRow label={booking.email}>{trip.email}</SummaryRow>
                <SummaryRow label={booking.phone}>
                  <span dir="ltr">{trip.phone}</span>
                </SummaryRow>
                {isAirport && trip.flightNumber && <SummaryRow label={booking.flightNumber}>{trip.flightNumber}</SummaryRow>}
                <SummaryRow label={booking.passengers}>{passengers}</SummaryRow>
                <SummaryRow label={booking.luggage}>{luggage}</SummaryRow>
                {trip.notes.trim() && <SummaryRow label={booking.notes}>{trip.notes.trim()}</SummaryRow>}
              </dl>
              <p className="mt-5 text-sm leading-6 text-muted-foreground">{flow.reviewNote}</p>
              {user && (
                <p className="mt-2 text-sm text-muted-foreground">
                  {booking.signedInAs.replace("{name}", user.first_name || user.email)}
                </p>
              )}
            </section>

            {status === "error" && (
              <p className="rounded-2xl border border-destructive/50 p-4 text-sm text-destructive" role="alert">
                {error.kind === "invalid"
                  ? `${booking.errorInvalid} ${error.fields.map((field) => booking[field]).join(", ")}.`
                  : error.kind === "rateLimited"
                    ? booking.errorRateLimited
                    : booking.error}
              </p>
            )}

            <div className="flex items-center justify-between gap-4">
              {backButton}
              <button
                type="button"
                className={buttonClassName({ size: "lg" })}
                disabled={status === "sending"}
                onClick={book}
              >
                {status === "sending" ? (
                  <>
                    <LoaderCircle aria-hidden="true" className="animate-spin" /> {booking.sending}
                  </>
                ) : (
                  <>
                    {booking.submit} <ArrowRight aria-hidden="true" className="rtl:-scale-x-100" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      <aside className="rounded-3xl border border-border bg-card p-5 sm:p-6 lg:sticky lg:top-[calc(var(--header-height)+1.5rem)]">
        <h2 className="font-display text-xl font-medium">{flow.journeyTitle}</h2>
        <dl className="mt-3">
          {trip.service && <SummaryRow label={booking.service}>{booking.serviceOptions[trip.service]}</SummaryRow>}
          {trip.city && <SummaryRow label={bar.city}>{cityNames[trip.city]}</SummaryRow>}
          {trip.pickup && <SummaryRow label={bar.pickup}>{trip.pickup}</SummaryRow>}
          {isHourly ? (
            <SummaryRow label={bar.duration}>
              {trip.hours} {booking.hoursUnit}
            </SummaryRow>
          ) : (
            trip.dropoff && <SummaryRow label={bar.dropoff}>{trip.dropoff}</SummaryRow>
          )}
          {trip.date && (
            <SummaryRow label={bar.date}>
              <span dir="ltr">
                {trip.date}
                {trip.time && ` · ${trip.time}`}
              </span>
            </SummaryRow>
          )}
          {vehicleName && <SummaryRow label={booking.vehicle}>{vehicleName}</SummaryRow>}
        </dl>
        {chosen && (
          <div className="mt-4 rounded-2xl bg-background p-4">
            <p className="text-sm text-muted-foreground">{flow.total}</p>
            <p className="mt-1 font-mono text-2xl font-bold text-primary">{priceText(chosen)}</p>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">{booking.priceNote}</p>
          </div>
        )}
      </aside>
    </div>
  );
}
