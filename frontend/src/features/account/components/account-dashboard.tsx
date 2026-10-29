"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { localeMeta, localePath, locales, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { setAccountUser, useAccount } from "../account-store";
import {
  changePassword,
  listMyQuoteRequests,
  signOut,
  updateProfile,
  type AccountUser,
  type CustomerQuoteRequest,
} from "../api";
import { accountErrorKey, type AccountErrorKey } from "../errors";
import { QUOTE_SENT_EVENT } from "../events";
import styles from "./account.module.css";
import { AccountField, FormMessage, SubmitButton } from "./form-parts";

interface AccountDashboardProps {
  locale: Locale;
  t: Dictionary["account"];
  serviceNames: Dictionary["quote"]["serviceOptions"];
  vehicleNames: Dictionary["quote"]["vehicleOptions"];
  cityNames: Dictionary["cities"]["names"];
}

type Names = Pick<AccountDashboardProps, "serviceNames" | "vehicleNames" | "cityNames">;

export function AccountDashboard({ locale, t, ...names }: AccountDashboardProps) {
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
        <QuoteRequests locale={locale} t={t} names={names} />
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

function QuoteRequests({ locale, t, names }: { locale: Locale; t: Dictionary["account"]; names: Names }) {
  const [requests, setRequests] = useState<CustomerQuoteRequest[] | null>(null);
  const [error, setError] = useState<AccountErrorKey | null>(null);

  const load = useCallback(() => {
    listMyQuoteRequests()
      .then(setRequests)
      .catch((caught) => setError(accountErrorKey(caught)));
  }, []);

  useEffect(() => {
    load();
    // A request sent from the quote form on this page appears straight away.
    window.addEventListener(QUOTE_SENT_EVENT, load);
    return () => window.removeEventListener(QUOTE_SENT_EVENT, load);
  }, [load]);

  const date = new Intl.DateTimeFormat(locale, { dateStyle: "medium" });

  return (
    <section className={styles.card} aria-labelledby="requests-title">
      <h2 id="requests-title" className={styles.cardTitle}>
        {t.dashboard.requestsTitle}
      </h2>
      <FormMessage error={error && t.errors[error]} />
      {requests?.length === 0 && <p className={styles.notice}>{t.dashboard.requestsEmpty}</p>}
      {requests && requests.length > 0 && (
        <ul className={styles.requests}>
          {requests.map((request) => (
            <li key={request.reference} className={styles.request}>
              <div className={styles.requestTop}>
                <span className={styles.reference} dir="ltr">
                  {request.reference}
                </span>
                <span className={styles.status} data-status={request.status}>
                  {t.dashboard.statuses[request.status]}
                </span>
              </div>
              <div className={styles.requestBody}>
                <strong>
                  {label(names.serviceNames, request.service_type)} · {label(names.cityNames, request.city)}
                </strong>
                <span>
                  {t.dashboard.journey}: {date.format(new Date(`${request.journey_date}T00:00`))},{" "}
                  <span dir="ltr">{request.journey_time.slice(0, 5)}</span> ·{" "}
                  {label(names.vehicleNames, request.vehicle_class)}
                </span>
                <span>
                  {request.pickup_location}
                  {request.destination && ` → ${request.destination}`}
                </span>
                <span>
                  {t.dashboard.sent}: {date.format(new Date(request.created_at))}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
      <p className={styles.cardLinks}>
        <a href="#quote">{t.dashboard.requestQuote}</a>
      </p>
    </section>
  );
}

function label(names: Record<string, string>, id: string) {
  return names[id] ?? id;
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
