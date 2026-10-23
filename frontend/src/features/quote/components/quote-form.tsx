"use client";

import { ArrowRight, Check, LoaderCircle } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import {
  CITIES,
  getVehicleCapacity,
  HIRE_HOURS,
  SERVICE_TYPES,
  VEHICLE_CLASSES,
  type City,
  type ServiceType,
  type VehicleClass,
} from "@/domain/booking";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { cn } from "@/lib/cn";
import { useQuoteSubmission } from "../hooks/use-quote-submission";
import { useQuotePreset } from "../quote-preset-context";
import type { QuoteRequestInput } from "../schema";
import { Field, NumberStepper, Select } from "./form-fields";
import styles from "./quote-form.module.css";

interface QuoteFormProps {
  locale: Locale;
  labels: Dictionary["quote"];
  cityNames: Dictionary["cities"]["names"];
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

export function QuoteForm({ locale, labels, cityNames }: QuoteFormProps) {
  // Vehicle, city and service can be pre-filled from elsewhere on the page.
  const { preset, update: updatePreset, reset: resetPreset } = useQuotePreset();
  const { vehicle, city, service: serviceType } = preset;
  const { status, reference, submit, reset } = useQuoteSubmission(locale);
  const [passengers, setPassengers] = useState(1);
  const [luggage, setLuggage] = useState(0);
  const [minDate, setMinDate] = useState<string>();

  // "Today" must come from the visitor's clock, not the build server's.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMinDate(todayIso()), []);

  // Counts are clamped to whichever vehicle is selected, including one picked from the fleet.
  const capacity = getVehicleCapacity(vehicle);
  const passengerCount = Math.min(passengers, capacity.passengers);
  const luggageCount = Math.min(luggage, capacity.luggage);
  const isHourly = serviceType === "hourly_hire";
  const stepperLabels = { increase: labels.increase, decrease: labels.decrease, max: labels.max };

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;

    const data = new FormData(form);
    const text = (name: string) => String(data.get(name) ?? "");

    const sent = await submit({
      firstName: text("firstName"),
      lastName: text("lastName"),
      email: text("email"),
      phone: text("phone"),
      city: text("city") as QuoteRequestInput["city"],
      serviceType: text("serviceType") as QuoteRequestInput["serviceType"],
      vehicleClass: vehicle,
      pickupLocation: text("pickupLocation"),
      destination: text("destination"),
      hireHours: isHourly ? Number(data.get("hireHours")) : null,
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
    }
  }

  if (status === "sent") {
    return (
      <div className={cn(styles.card, styles.success)} role="status">
        <span className={styles.successIcon}>
          <Check aria-hidden="true" />
        </span>
        <Eyebrow>{labels.successEyebrow}</Eyebrow>
        <h3>{labels.successTitle}</h3>
        <p>
          {labels.successBodyBefore}
          <strong>{reference}</strong>
          {labels.successBodyAfter}
        </p>
        <Button className={styles.submit} onClick={reset}>
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
        <Field label={labels.firstName}>
          <input
            name="firstName"
            autoComplete="given-name"
            required
            minLength={2}
            maxLength={60}
            placeholder={labels.firstNamePlaceholder}
          />
        </Field>
        <Field label={labels.lastName}>
          <input
            name="lastName"
            autoComplete="family-name"
            required
            maxLength={60}
            placeholder={labels.lastNamePlaceholder}
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
          />
        </Field>

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
            {CITIES.map((city) => (
              <option key={city} value={city}>
                {cityNames[city]}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={labels.service}>
          <Select
            name="serviceType"
            required
            value={serviceType}
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
            name="vehicleClass"
            required
            value={vehicle}
            onChange={(event) => updatePreset({ vehicle: event.target.value as VehicleClass })}
          >
            {VEHICLE_CLASSES.map((option) => (
              <option key={option} value={option}>
                {labels.vehicleOptions[option]}
              </option>
            ))}
          </Select>
        </Field>

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
            <Select name="hireHours" required defaultValue={String(HIRE_HOURS.min)}>
              {HOUR_OPTIONS.map((hours) => (
                <option key={hours} value={hours}>
                  {hours} {labels.hoursUnit}
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

        <Field label={labels.date}>
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
        <p>{labels.privacy}</p>
        <Button type="submit" className={styles.submit} disabled={status === "sending"}>
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
          {labels.error}
        </p>
      )}
    </form>
  );
}
