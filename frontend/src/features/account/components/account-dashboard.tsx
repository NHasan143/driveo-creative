"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { listMyBookings, type BookingDto } from "@/features/booking/api/bookings";
import { manageBookingHref } from "@/features/booking/book-link";
import Link from "next/link";
import { localeMeta, localePath, locales, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { formatPrice } from "@/lib/format-price";
import { setAccountUser, useAccount } from "../account-store";
import {
  changePassword,
  signOut,
  updateProfile,
  type AccountUser,
} from "../api";
import { accountErrorKey, type AccountErrorKey } from "../errors";
import { BOOKING_MADE_EVENT } from "../events";
import styles from "./account.module.css";
import { AccountField, FormMessage, SubmitButton } from "./form-parts";

interface AccountDashboardProps {
  locale: Locale;
  t: Dictionary["account"];
}

export function AccountDashboard({ locale, t }: AccountDashboardProps) {
  const router = useRouter();
  const { status, user } = useAccount();

  useEffect(() => {
    if (status === "ready" && !user) router.replace(localePath(locale, "/account/sign-in"));
  }, [status, user, router, locale]);

  if (!user) {
    return (
      <p role="status" className={styles.intro}>
        {t.dashboard.loading}
      </p>
    );
  }

  async function onSignOut() {
    try {
      await signOut();
    } finally {
      setAccountUser(null);
    }
  }

  return (
    <>
      <header>
        <Eyebrow>{t.eyebrow}</Eyebrow>
        <h1 className={styles.title}>
          {t.dashboard.welcome.replace("{name}", user.first_name || user.email)}
        </h1>
        <p className={styles.intro}>{t.dashboard.intro}</p>
      </header>
      <div className={styles.dashboard}>
        <Bookings locale={locale} t={t} />
        <div className="grid gap-8">
          <ProfileForm user={user} t={t} />
          <PasswordForm t={t} />
          <Button variant="secondary" className={styles.signOut} onClick={onSignOut}>
            {t.dashboard.signOut}
          </Button>
        </div>
      </div>
    </>
  );
}

function Bookings({ locale, t }: { locale: Locale; t: Dictionary["account"] }) {
  const [bookings, setBookings] = useState<BookingDto[] | null>(null);
  const [error, setError] = useState<AccountErrorKey | null>(null);

  const load = useCallback(() => {
    listMyBookings()
      .then(setBookings)
      .catch((caught) => setError(accountErrorKey(caught)));
  }, []);

  useEffect(() => {
    load();
    // A booking made with the form on this page appears straight away.
    window.addEventListener(BOOKING_MADE_EVENT, load);
    return () => window.removeEventListener(BOOKING_MADE_EVENT, load);
  }, [load]);

  const date = new Intl.DateTimeFormat(locale, { dateStyle: "medium" });
  const name = (names: BookingDto["service_name"], fallback: string) => names?.[locale] || names?.en || fallback;

  return (
    <section className={styles.card} aria-labelledby="bookings-title">
      <h2 id="bookings-title" className={styles.cardTitle}>
        {t.dashboard.bookingsTitle}
      </h2>
      <FormMessage error={error && t.errors[error]} />
      {bookings?.length === 0 && <p className={styles.notice}>{t.dashboard.bookingsEmpty}</p>}
      {bookings && bookings.length > 0 && (
        <ul className={styles.requests}>
          {bookings.map((booking) => (
            <li key={booking.reference} className={styles.request}>
              <div className={styles.requestTop}>
                <span className={styles.reference} dir="ltr">
                  {booking.reference}
                </span>
                <span className={styles.status} data-status={booking.status}>
                  {t.dashboard.statuses[booking.status]}
                </span>
              </div>
              <div className={styles.requestBody}>
                <strong>
                  {name(booking.service_name, booking.service)} · {name(booking.city_name, booking.city)}
                </strong>
                <span>
                  {date.format(new Date(`${booking.journey_date}T00:00`))},{" "}
                  <span dir="ltr">{booking.journey_time.slice(0, 5)}</span> ·{" "}
                  {name(booking.vehicle_name, booking.vehicle)}
                </span>
                <span>
                  {booking.pickup_location}
                  {booking.destination && ` → ${booking.destination}`}
                </span>
                <span>
                  {t.dashboard.price}: {formatPrice(Number(booking.total_price), locale)}
                </span>
              </div>
              <Link className={styles.inlineLink} href={manageBookingHref(locale, booking.reference)}>
                {t.dashboard.manage}
              </Link>
            </li>
          ))}
        </ul>
      )}
      <p className={styles.cardLinks}>
        <a href="#book">{t.dashboard.bookNow}</a>
      </p>
    </section>
  );
}

function ProfileForm({ user, t }: { user: AccountUser; t: Dictionary["account"] }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<AccountErrorKey | null>(null);
  const [saved, setSaved] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const text = (name: string) => String(data.get(name) ?? "").trim();
    setBusy(true);
    setError(null);
    setSaved(false);
    try {
      const updated = await updateProfile({
        first_name: text("firstName"),
        last_name: text("lastName"),
        email: text("email"),
        phone: text("phone"),
        locale: text("locale") as Locale,
      });
      setAccountUser(updated);
      setSaved(true);
    } catch (caught) {
      setError(accountErrorKey(caught, { email: "emailTaken", phone: "phoneInvalid" }));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className={styles.card} onSubmit={onSubmit} aria-labelledby="profile-title">
      <h2 id="profile-title" className={styles.cardTitle}>
        {t.dashboard.profileTitle}
      </h2>
      <div className={styles.row}>
        <AccountField
          label={t.fields.firstName}
          name="firstName"
          autoComplete="given-name"
          required
          maxLength={150}
          defaultValue={user.first_name}
        />
        <AccountField
          label={t.fields.lastName}
          name="lastName"
          autoComplete="family-name"
          maxLength={150}
          defaultValue={user.last_name}
        />
      </div>
      <AccountField
        label={t.fields.email}
        name="email"
        type="email"
        autoComplete="email"
        required
        maxLength={254}
        defaultValue={user.email}
      />
      <AccountField
        label={t.fields.phone}
        name="phone"
        type="tel"
        autoComplete="tel"
        maxLength={40}
        pattern={String.raw`[\d+ \(\)\.\/\-]{7,40}`}
        dir="ltr"
        defaultValue={user.phone}
      />
      <label className={styles.field}>
        <span className={styles.label}>{t.fields.language}</span>
        <select name="locale" defaultValue={user.locale}>
          {locales.map((code) => (
            <option key={code} value={code}>
              {localeMeta[code].label}
            </option>
          ))}
        </select>
      </label>
      <FormMessage error={error && t.errors[error]} notice={saved ? t.dashboard.saved : null} />
      <SubmitButton busy={busy} label={t.dashboard.save} busyLabel={t.dashboard.saving} />
    </form>
  );
}

function PasswordForm({ t }: { t: Dictionary["account"] }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<AccountErrorKey | null>(null);
  const [changed, setChanged] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setBusy(true);
    setError(null);
    setChanged(false);
    try {
      await changePassword(String(data.get("currentPassword") ?? ""), String(data.get("newPassword") ?? ""));
      form.reset();
      setChanged(true);
    } catch (caught) {
      setError(
        accountErrorKey(caught, {
          current_password: "currentPassword",
          new_password: "passwordWeak",
        }),
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className={styles.card} onSubmit={onSubmit} aria-labelledby="password-title">
      <h2 id="password-title" className={styles.cardTitle}>
        {t.dashboard.passwordTitle}
      </h2>
      <AccountField
        label={t.fields.currentPassword}
        name="currentPassword"
        type="password"
        autoComplete="current-password"
        required
        maxLength={128}
      />
      <AccountField
        label={t.fields.newPassword}
        name="newPassword"
        type="password"
        autoComplete="new-password"
        required
        minLength={8}
        maxLength={128}
        hint={t.register.passwordHint}
      />
      <FormMessage error={error && t.errors[error]} notice={changed ? t.dashboard.passwordChanged : null} />
      <SubmitButton busy={busy} label={t.dashboard.changePassword} busyLabel={t.dashboard.saving} />
    </form>
  );
}
