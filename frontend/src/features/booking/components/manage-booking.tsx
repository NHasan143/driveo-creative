"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { FLEET_VEHICLES, getVehicleCapacity, HIRE_HOURS, type FleetVehicle } from "@/domain/booking";
import accountStyles from "@/features/account/components/account.module.css";
import { localePath, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { ApiError } from "@/lib/api/http-client";
import { formatPrice } from "@/lib/format-price";
import {
  cancelBooking,
  changeBooking,
  closedReason,
  getBooking,
  type BookingChangeDto,
  type BookingDto,
} from "../api/bookings";

interface ManageBookingProps {
  locale: Locale;
  t: Dictionary["manageBooking"];
  fields: Dictionary["booking"];
}

type Problem = "notFound" | "tooLate" | "closed" | "invalid" | "failed" | "unavailable";

function problemOf(error: unknown): Problem {
  const closed = closedReason(error);
  if (closed) return closed === "too_late" ? "tooLate" : "closed";
  if (error instanceof ApiError) {
    if (error.status === 0) return "unavailable";
    if (error.status === 404) return "notFound";
    if (error.status === 400) return "invalid";
  }
  return "failed";
}

function nameIn(locale: Locale, names: BookingDto["service_name"], fallback: string) {
  return names?.[locale] || names?.en || fallback;
}

/** /booking?ref=…&token=… — view, change or cancel one booking. */
export function ManageBooking({ locale, t, fields }: ManageBookingProps) {
  const params = useSearchParams();
  const reference = params.get("ref") ?? "";
  const token = params.get("token");
  const [booking, setBooking] = useState<BookingDto | null>(null);
  const [problem, setProblem] = useState<Problem | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [mode, setMode] = useState<"view" | "change" | "cancel">("view");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!reference) return;
    getBooking(reference, token)
      .then(setBooking)
      .catch((error) => setProblem(problemOf(error)));
  }, [reference, token]);

  if (!booking) {
    // Without a reference in the link there is nothing to load.
    const shown = reference ? problem : "notFound";
    return shown ? (
      <div className={accountStyles.card} role="alert">
        <p className={accountStyles.notice}>{t.problems[shown]}</p>
        <p className={accountStyles.cardLinks}>
          <Link href={localePath(locale, "/account/sign-in")}>{t.signIn}</Link>
        </p>
      </div>
    ) : (
      <p role="status" className={accountStyles.intro}>
        {t.loading}
      </p>
    );
  }

  const date = new Intl.DateTimeFormat(locale, { dateStyle: "full" }).format(new Date(`${booking.journey_date}T00:00`));
  const deadline = new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(
    new Date(booking.change_deadline),
  );
  const total = formatPrice(Number(booking.total_price), locale);

  async function run(action: () => Promise<BookingDto>, done: string) {
    setBusy(true);
    setProblem(null);
    setNotice(null);
    try {
      setBooking(await action());
      setMode("view");
      setNotice(done);
    } catch (error) {
      setProblem(problemOf(error));
    } finally {
      setBusy(false);
    }
  }

  function onChange(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const text = (name: string) => String(data.get(name) ?? "").trim();
    const hourly = booking!.price_unit === "hour";
    const changes: BookingChangeDto = {
      vehicle: text("vehicle"),
      pickup_location: text("pickupLocation"),
      destination: hourly ? "" : text("destination"),
      hire_hours: hourly ? Number(text("hireHours")) : null,
      flight_number: text("flightNumber"),
      journey_date: text("journeyDate"),
      journey_time: text("journeyTime"),
      passengers: Number(text("passengers")),
      luggage: Number(text("luggage")),
      notes: text("notes"),
    };
    void run(() => changeBooking(booking!.reference, token, changes), t.changed);
  }

  return (
    <>
      <header>
        <Eyebrow>{t.eyebrow}</Eyebrow>
        <h1 className={accountStyles.title}>{nameIn(locale, booking.service_name, booking.service)}</h1>
        <p className={accountStyles.intro}>
          <span dir="ltr">{booking.reference}</span> · {t.statuses[booking.status]}
        </p>
      </header>

      <div className={accountStyles.dashboard}>
        <section className={accountStyles.card} aria-labelledby="booking-details">
          <h2 id="booking-details" className={accountStyles.cardTitle}>
            {t.detailsTitle}
          </h2>
          {notice && (
            <p role="status" className={accountStyles.notice}>
              {notice}
            </p>
          )}
          <dl className={accountStyles.requestBody}>
            <Row label={t.labels.when}>
              {date}, <span dir="ltr">{booking.journey_time.slice(0, 5)}</span>
            </Row>
            <Row label={t.labels.city}>{nameIn(locale, booking.city_name, booking.city)}</Row>
            <Row label={t.labels.from}>{booking.pickup_location}</Row>
            {booking.price_unit === "hour" ? (
              <Row label={t.labels.hours}>{booking.hire_hours}</Row>
            ) : (
              <Row label={t.labels.to}>{booking.destination}</Row>
            )}
            {booking.flight_number && (
              <Row label={fields.flightNumber}>
                <span dir="ltr">{booking.flight_number}</span>
              </Row>
            )}
            <Row label={t.labels.vehicle}>
              {nameIn(locale, booking.vehicle_name, booking.vehicle)} · {booking.passengers} {t.labels.passengers} ·{" "}
              {booking.luggage} {t.labels.luggage}
            </Row>
            {booking.notes && <Row label={fields.notes}>{booking.notes}</Row>}
            <Row label={t.labels.price}>
              <strong>{total}</strong>
            </Row>
          </dl>
          <p className={accountStyles.hint}>{t.payNote}</p>
          {booking.status === "confirmed" && (booking.chauffeur_name || booking.vehicle_details) && (
            <dl className={accountStyles.requestBody}>
              {booking.chauffeur_name && (
                <Row label={t.labels.chauffeur}>
                  {booking.chauffeur_name} <span dir="ltr">{booking.chauffeur_phone}</span>
                </Row>
              )}
              {booking.vehicle_details && <Row label={t.labels.car}>{booking.vehicle_details}</Row>}
            </dl>
          )}
        </section>

        <div className="grid gap-8">
          {problem && (
            <p role="alert" className={accountStyles.error}>
              {t.problems[problem]}
            </p>
          )}

          {booking.can_change && mode === "view" && (
            <div className={accountStyles.card}>
              <p className={accountStyles.notice}>{t.changeUntil.replace("{deadline}", deadline)}</p>
              <div className="flex flex-wrap gap-3">
                <Button onClick={() => setMode("change")}>{t.change}</Button>
                <Button variant="secondary" onClick={() => setMode("cancel")}>
                  {t.cancel}
                </Button>
              </div>
            </div>
          )}

          {!booking.can_change && booking.status !== "cancelled" && booking.status !== "completed" && (
            <p className={accountStyles.links}>{t.problems.tooLate}</p>
          )}

          {mode === "cancel" && (
            <div className={accountStyles.card} role="alertdialog" aria-labelledby="cancel-title">
              <h2 id="cancel-title" className={accountStyles.cardTitle}>
                {t.cancelTitle}
              </h2>
              <p className={accountStyles.notice}>{t.cancelBody}</p>
              <div className="flex flex-wrap gap-3">
                <Button disabled={busy} onClick={() => run(() => cancelBooking(booking.reference, token), t.cancelled)}>
                  {t.cancelConfirm}
                </Button>
                <Button variant="secondary" onClick={() => setMode("view")}>
                  {t.keep}
                </Button>
              </div>
            </div>
          )}

          {mode === "change" && (
            <ChangeForm
              booking={booking}
              t={t}
              fields={fields}
              busy={busy}
              onSubmit={onChange}
              onBack={() => setMode("view")}
            />
          )}
        </div>
      </div>
    </>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className={accountStyles.label}>{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

interface ChangeFormProps {
  booking: BookingDto;
  t: Dictionary["manageBooking"];
  fields: Dictionary["booking"];
  busy: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onBack: () => void;
}

function ChangeForm({ booking, t, fields, busy, onSubmit, onBack }: ChangeFormProps) {
  const [vehicle, setVehicle] = useState<FleetVehicle>(
    (FLEET_VEHICLES as readonly string[]).includes(booking.vehicle) ? (booking.vehicle as FleetVehicle) : "first_class",
  );
  const capacity = getVehicleCapacity(vehicle);
  const hourly = booking.price_unit === "hour";

  return (
    <form className={accountStyles.card} onSubmit={onSubmit} aria-labelledby="change-title">
      <h2 id="change-title" className={accountStyles.cardTitle}>
        {t.changeTitle}
      </h2>
      <p className={accountStyles.hint}>{t.changeNote}</p>
      <div className={accountStyles.row}>
        <label className={accountStyles.field}>
          <span className={accountStyles.label}>{fields.date}</span>
          <input name="journeyDate" type="date" required defaultValue={booking.journey_date} />
        </label>
        <label className={accountStyles.field}>
          <span className={accountStyles.label}>{fields.time}</span>
          <input name="journeyTime" type="time" required defaultValue={booking.journey_time.slice(0, 5)} />
        </label>
      </div>
      <label className={accountStyles.field}>
        <span className={accountStyles.label}>{fields.pickup}</span>
        <input name="pickupLocation" required minLength={2} maxLength={300} defaultValue={booking.pickup_location} />
      </label>
      {hourly ? (
        <label className={accountStyles.field}>
          <span className={accountStyles.label}>{fields.hoursField}</span>
          <input
            name="hireHours"
            type="number"
            required
            min={HIRE_HOURS.min}
            max={HIRE_HOURS.max}
            defaultValue={booking.hire_hours ?? HIRE_HOURS.min}
          />
        </label>
      ) : (
        <label className={accountStyles.field}>
          <span className={accountStyles.label}>{fields.destination}</span>
          <input name="destination" required minLength={2} maxLength={300} defaultValue={booking.destination} />
        </label>
      )}
      {booking.service === "airport_transfer" && (
        <label className={accountStyles.field}>
          <span className={accountStyles.label}>{fields.flightNumber}</span>
          <input name="flightNumber" maxLength={12} dir="ltr" defaultValue={booking.flight_number} />
        </label>
      )}
      <label className={accountStyles.field}>
        <span className={accountStyles.label}>{fields.vehicle}</span>
        <select name="vehicle" value={vehicle} onChange={(event) => setVehicle(event.target.value as FleetVehicle)}>
          {FLEET_VEHICLES.map((option) => (
            <option key={option} value={option}>
              {fields.vehicleOptions[option]}
            </option>
          ))}
        </select>
      </label>
      <div className={accountStyles.row}>
        <label className={accountStyles.field}>
          <span className={accountStyles.label}>{fields.passengers}</span>
          <input
            name="passengers"
            type="number"
            required
            min={1}
            max={capacity.passengers}
            defaultValue={Math.min(booking.passengers, capacity.passengers)}
          />
        </label>
        <label className={accountStyles.field}>
          <span className={accountStyles.label}>{fields.luggage}</span>
          <input
            name="luggage"
            type="number"
            required
            min={0}
            max={capacity.luggage}
            defaultValue={Math.min(booking.luggage, capacity.luggage)}
          />
        </label>
      </div>
      <label className={accountStyles.field}>
        <span className={accountStyles.label}>{fields.notes}</span>
        <input name="notes" maxLength={1500} defaultValue={booking.notes} />
      </label>
      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={busy}>
          {busy ? t.saving : t.save}
        </Button>
        <Button variant="secondary" onClick={onBack}>
          {t.back}
        </Button>
      </div>
    </form>
  );
}
