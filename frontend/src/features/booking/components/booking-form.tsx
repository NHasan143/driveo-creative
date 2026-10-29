"use client";

import { ArrowRight, Check, LoaderCircle } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { Button, buttonClassName } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
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
import { useBookingPreset } from "../booking-preset-context";
import { useBookingSubmission } from "../hooks/use-booking-submission";
import type { BookingRequestInput } from "../schema";
import { Field, NumberStepper, Select } from "./form-fields";
import styles from "./booking-form.module.css";

interface BookingFormProps {
  locale: Locale;
  labels: Dictionary["booking"];
  cityNames: Dictionary["cities"]["names"];
  pricing: Dictionary["pricing"];
  prices: ServicePrices;
}

const HOUR_OPTIONS = Array.from(
  { length: HIRE_HOURS.max - HIRE_HOURS.min + 1 },
  (_, index) => HIRE_HOURS.min + index,
);

function todayIso() {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 10);
}

/** The private page where a guest views, changes or cancels their booking. */
export function manageBookingHref(locale: Locale, reference: string, token?: string) {
  const query = new URLSearchParams({ ref: reference, ...(token && { token }) });
  return `${localePath(locale, "/booking")}&${query}`;
}

export function BookingForm({ locale, labels, cityNames, pricing, prices }: BookingFormProps) {
  // Vehicle, city and service can be pre-filled from elsewhere on the page.
  const { preset, update: updatePreset, reset: resetPreset } = useBookingPreset();
  const { vehicle, city, service } = preset;
  const { status, error, booking, submit, reset } = useBookingSubmission(locale);
  const { user } = useAccount();
  const [passengers, setPassengers] = useState(1);
  const [luggage, setLuggage] = useState(0);
  const [hours, setHours] = useState<number>(HIRE_HOURS.min);
  const [minDate, setMinDate] = useState<string>();

  // "Today" must come from the visitor's clock, not the build server's.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMinDate(todayIso()), []);

  // Counts are clamped to whichever vehicle is selected, including one picked from the fleet.
  const capacity = getVehicleCapacity(vehicle);
  const passengerCount = Math.min(passengers, capacity.passengers);
  const luggageCount = Math.min(luggage, capacity.luggage);
  const isHourly = service === "hourly_hire";
  const isAirport = service === "airport_transfer";
  const stepperLabels = { increase: labels.increase, decrease: labels.decrease, max: labels.max };

  // The price from the admin's grid; the API prices the booking again from the same grid.
  const grid = service ? prices[service] : undefined;
  const unitPrice = grid && city && vehicle ? grid.amounts[`${city}:${vehicle}`] : undefined;
  const chosen = Boolean(service && city && vehicle);
  const unavailable = chosen && unitPrice === undefined;
  let priceText: string | null = null;
  if (unitPrice !== undefined) {
    priceText =
      grid?.unit === "hour"
        ? pricing.hoursTotal
            .replace("{price}", formatPrice(unitPrice * (isHourly ? hours : 1), locale))
            .replace("{hours}", String(isHourly ? hours : 1))
        : formatPrice(unitPrice, locale);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity() || unavailable) return;

    const data = new FormData(form);
    const text = (name: string) => String(data.get(name) ?? "");

    const sent = await submit({
      firstName: text("firstName"),
      lastName: text("lastName"),
      email: text("email"),
      phone: text("phone"),
      city: text("city") as BookingRequestInput["city"],
      service: text("service") as BookingRequestInput["service"],
      vehicle: text("vehicle") as BookingRequestInput["vehicle"],
      pickupLocation: text("pickupLocation"),
      destination: text("destination"),
      hireHours: isHourly ? Number(data.get("hireHours")) : null,
      flightNumber: text("flightNumber"),
      journeyDate: text("journeyDate"),
      journeyTime: text("journeyTime"),
      passengers: passengerCount,
      luggage: luggageCount,
      notes: text("notes"),
      honeypot: text("website_hp"),
    });

    if (sent) {
      resetPreset();
      setPassengers(1);
      setLuggage(0);
      setHours(HIRE_HOURS.min);
    }
  }

  if (status === "sent" && booking) {
    const total = booking.total_price ? formatPrice(Number(booking.total_price), locale) : null;
    return (
      <div className={cn(styles.card, styles.success)} role="status">
        <span className={styles.successIcon}>
          <Check aria-hidden="true" />
        </span>
        <Eyebrow>{labels.successEyebrow}</Eyebrow>
        <h3>{labels.successTitle}</h3>
        <p>
          {labels.successReference} <strong dir="ltr">{booking.reference}</strong>
          <br />
          {labels.successNext}
          {total && (
            <>
              <br />
              {labels.successPrice.replace("{price}", total)}
            </>
          )}
        </p>
        <div className="flex flex-wrap items-center gap-4">
          <Link
            className={buttonClassName({}, styles.submit)}
            href={manageBookingHref(locale, booking.reference, booking.manage_token)}
          >
            {labels.manageLink}
          </Link>
          {user && (
            <Link className="underline underline-offset-4" href={localePath(locale, "/account")}>
              {labels.accountLink}
            </Link>
          )}
        </div>
        <Button className="mt-6" variant="secondary" onClick={reset}>
          {labels.again}
        </Button>
      </div>
    );
  }

  return (
    <form className={styles.card} onSubmit={handleSubmit}>
      <input
        className={styles.honeypot}
        name="website_hp"
        type="text"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        data-lpignore="true"
        data-1p-ignore="true"
      />

      <div className={styles.grid}>
        {/* Signed-in customers get their details filled in; the key re-applies them once known. */}
        <div key={user ? `account-${user.id}` : "guest"} className="contents">
          <Field label={labels.firstName}>
            <input
              name="firstName"
              autoComplete="given-name"
              required
              minLength={2}
              maxLength={60}
              placeholder={labels.firstNamePlaceholder}
              defaultValue={user?.first_name}
            />
          </Field>
          <Field label={labels.lastName}>
            <input
              name="lastName"
              autoComplete="family-name"
              required
              maxLength={60}
              placeholder={labels.lastNamePlaceholder}
              defaultValue={user?.last_name}
            />
          </Field>
          <Field label={labels.email}>
            <input
              name="email"
              type="email"
              autoComplete="email"
              required
              maxLength={254}
              placeholder="you@example.com"
              defaultValue={user?.email}
            />
          </Field>
          <Field label={labels.phone}>
            <input
              name="phone"
              type="tel"
              autoComplete="tel"
              required
              minLength={7}
              maxLength={40}
              pattern={String.raw`[\d+ \(\)\.\/\-]+`}
              placeholder="+44"
              dir="ltr"
              defaultValue={user?.phone}
            />
          </Field>
        </div>

        <Field label={labels.city}>
          <Select
            name="city"
            required
            value={city}
            onChange={(event) => updatePreset({ city: event.target.value as City })}
          >
            <option value="" disabled>
              {labels.selectCity}
            </option>
            {CITIES.map((option) => (
              <option key={option} value={option}>
                {cityNames[option]}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={labels.service}>
          <Select
            name="service"
            required
            value={service}
            onChange={(event) => updatePreset({ service: event.target.value as ServiceType })}
          >
            <option value="" disabled>
              {labels.selectService}
            </option>
            {SERVICE_TYPES.map((type) => (
              <option key={type} value={type}>
                {labels.serviceOptions[type]}
              </option>
            ))}
          </Select>
        </Field>

        <Field label={labels.vehicle} wide>
          <Select
            name="vehicle"
            required
            value={vehicle}
            onChange={(event) => updatePreset({ vehicle: event.target.value as FleetVehicle })}
          >
            <option value="" disabled>
              {labels.selectVehicle}
            </option>
            {FLEET_VEHICLES.map((option) => (
              <option key={option} value={option}>
                {labels.vehicleOptions[option]}
              </option>
            ))}
          </Select>
        </Field>

        {(priceText || unavailable) && (
          <div className={cn(styles.guide, styles.spanTwo)} role="status">
            {priceText ? (
              <>
                <span className={styles.label}>{labels.price}</span>
                <strong>{priceText}</strong>
                <p className={styles.hint}>{labels.priceNote}</p>
              </>
            ) : (
              <p className={styles.hint}>{labels.unavailable}</p>
            )}
          </div>
        )}

        <Field label={labels.pickup} wide>
          <input
            name="pickupLocation"
            required
            minLength={2}
            maxLength={300}
            placeholder={labels.pickupPlaceholder}
          />
        </Field>

        {isHourly ? (
          <Field label={labels.hours} wide hint={labels.hourlyNote}>
            <Select
              name="hireHours"
              required
              value={String(hours)}
              onChange={(event) => setHours(Number(event.target.value))}
            >
              {HOUR_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option} {labels.hoursUnit}
                </option>
              ))}
            </Select>
          </Field>
        ) : (
          <Field label={labels.destination} wide>
            <input
              name="destination"
              required
              minLength={2}
              maxLength={300}
              placeholder={labels.destinationPlaceholder}
            />
          </Field>
        )}

        {isAirport && (
          <Field label={labels.flightNumber} wide>
            <input
              name="flightNumber"
              maxLength={12}
              pattern="[A-Za-z0-9 ]*"
              placeholder={labels.flightNumberPlaceholder}
              dir="ltr"
            />
          </Field>
        )}

        <Field label={labels.date} hint={labels.dateHint}>
          <input name="journeyDate" type="date" required min={minDate} />
        </Field>
        <Field label={labels.time}>
          <input name="journeyTime" type="time" required />
        </Field>

        <NumberStepper
          label={labels.passengers}
          name="passengers"
          value={passengerCount}
          min={1}
          max={capacity.passengers}
          onChange={setPassengers}
          labels={stepperLabels}
        />
        <NumberStepper
          label={labels.luggage}
          name="luggage"
          value={luggageCount}
          min={0}
          max={capacity.luggage}
          onChange={setLuggage}
          labels={stepperLabels}
        />

        <Field label={labels.notes} wide>
          <textarea name="notes" maxLength={1500} rows={4} placeholder={labels.notesPlaceholder} />
        </Field>
      </div>

      <div className={styles.actions}>
        <p>
          {labels.privacy}
          {user && (
            <span className="mt-1 block">{labels.signedInAs.replace("{name}", user.first_name || user.email)}</span>
          )}
        </p>
        <Button type="submit" className={styles.submit} disabled={status === "sending" || unavailable}>
          {status === "sending" ? (
            <>
              <LoaderCircle aria-hidden="true" className={styles.spinner} /> {labels.sending}
            </>
          ) : (
            <>
              {labels.submit} <ArrowRight aria-hidden="true" className="rtl:-scale-x-100" />
            </>
          )}
        </Button>
      </div>

      {status === "error" && (
        <p className={styles.error} role="alert">
          {error.kind === "invalid"
            ? `${labels.errorInvalid} ${error.fields.map((field) => labels[field]).join(", ")}.`
            : error.kind === "rateLimited"
              ? labels.errorRateLimited
              : labels.error}
        </p>
      )}
    </form>
  );
}
