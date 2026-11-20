"use client";

import { useId, useState, type FormEvent, type ReactNode } from "react";
import { ArrowRightIcon, CaretDownIcon, ChevronDownIcon } from "@/components/icons/design-icons";
import { siteConfig } from "@/config/site";
import type { Dictionary } from "@/i18n/get-dictionary";
import { cn } from "@/lib/cn";

type Copy = Dictionary["site"]["business"]["enquiry"];

interface EnquiryFormProps {
  copy: Copy;
  cities: string[];
  services: string[];
}

const DIAL_CODES = ["+44", "+33", "+359", "+971", "+1"];
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type FieldName = "fullName" | "workEmail" | "companyName";

const lineClass =
  "h-9 w-full min-w-0 appearance-none border-0 border-b bg-transparent p-0 text-[0.9375rem] tracking-[-0.01em] text-ink placeholder:text-ink/45 focus:outline-none";

function Field({
  label,
  htmlFor,
  error,
  children,
  className,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <label htmlFor={htmlFor} className="text-sm tracking-[-0.01em] text-body">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${htmlFor}-error`} className="text-[0.8125rem] font-medium text-error-text">
          {error}
        </p>
      )}
    </div>
  );
}

function SelectLine({ id, name, options, placeholder }: { id: string; name: string; options: string[]; placeholder: string }) {
  return (
    <div className="relative">
      <select
        id={id}
        name={name}
        defaultValue=""
        className={cn(lineClass, "border-[#979490] pe-6 focus:border-amber [&:has(option[value='']:checked)]:text-ink/45")}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <CaretDownIcon aria-hidden="true" className="pointer-events-none absolute end-0 top-1/2 size-4 -translate-y-1/2 text-ink" />
    </div>
  );
}

/**
 * "Let's set up your company account." The form checks the required fields, then
 * opens the visitor's email app with the enquiry addressed to the Driveo team.
 */
export function EnquiryForm({ copy, cities, services }: EnquiryFormProps) {
  const id = useId();
  const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({});
  const [sent, setSent] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const value = (name: string) => String(data.get(name) ?? "").trim();

    const next: Partial<Record<FieldName, string>> = {};
    if (!value("fullName")) next.fullName = copy.required;
    if (!value("workEmail")) next.workEmail = copy.required;
    else if (!EMAIL_PATTERN.test(value("workEmail"))) next.workEmail = copy.invalidEmail;
    if (!value("companyName")) next.companyName = copy.required;
    setErrors(next);
    if (Object.keys(next).length > 0) {
      const first = Object.keys(next)[0];
      document.getElementById(`${id}-${first}`)?.focus();
      return;
    }

    const phone = value("phone") ? `${value("dialCode")} ${value("phone")}` : "";
    const lines = [
      [copy.fullName, value("fullName")],
      [copy.workEmail, value("workEmail")],
      [copy.phone, phone],
      [copy.companyName, value("companyName")],
      [copy.companySize, value("companySize")],
      [copy.location, value("location")],
      [copy.service, value("service")],
      [copy.frequency, value("frequency")],
      [copy.details, value("details")],
    ]
      .filter(([, answer]) => answer)
      .map(([label, answer]) => `${label}: ${answer}`);

    const mailto = `mailto:${siteConfig.contact.email}?subject=${encodeURIComponent(copy.emailSubject)}&body=${encodeURIComponent(lines.join("\n"))}`;
    window.location.href = mailto;
    setSent(true);
  }

  const fieldId = (name: string) => `${id}-${name}`;
  const errorProps = (name: FieldName) =>
    errors[name]
      ? { "aria-invalid": true as const, "aria-describedby": `${fieldId(name)}-error` }
      : {};
  const underline = (name: FieldName) => (errors[name] ? "border-error" : "border-[#979490] focus:border-amber");

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      className="mx-auto flex w-full max-w-[36.9375rem] flex-col gap-7 rounded-xl border border-cream-border bg-white p-6 shadow-[0_2px_3px_rgba(25,22,18,0.07)] xl:gap-8 xl:p-9"
    >
      <div className="grid gap-7 md:grid-cols-2 md:gap-x-8 md:gap-y-10">
        <Field label={copy.fullName} htmlFor={fieldId("fullName")} error={errors.fullName}>
          <input id={fieldId("fullName")} name="fullName" autoComplete="name" className={cn(lineClass, underline("fullName"))} {...errorProps("fullName")} />
        </Field>

        <Field label={copy.workEmail} htmlFor={fieldId("workEmail")} error={errors.workEmail}>
          <input
            id={fieldId("workEmail")}
            name="workEmail"
            type="email"
            autoComplete="email"
            placeholder={copy.emailPlaceholder}
            className={cn(lineClass, underline("workEmail"))}
            {...errorProps("workEmail")}
          />
        </Field>

        <Field label={copy.phone} htmlFor={fieldId("phone")}>
          <div className="flex h-9 items-center gap-1.5 border-b border-[#979490] focus-within:border-amber">
            <div className="relative shrink-0">
              <select name="dialCode" aria-label={copy.phone} defaultValue="+44" className="h-9 appearance-none bg-transparent pe-4 text-[0.9375rem] text-ink focus:outline-none">
                {DIAL_CODES.map((code) => (
                  <option key={code} value={code}>
                    {code}
                  </option>
                ))}
              </select>
              <ChevronDownIcon aria-hidden="true" className="pointer-events-none absolute end-0 top-1/2 size-3 -translate-y-1/2 text-ink" />
            </div>
            <input id={fieldId("phone")} name="phone" type="tel" autoComplete="tel-national" className={cn(lineClass, "border-0")} />
          </div>
        </Field>

        <Field label={copy.companyName} htmlFor={fieldId("companyName")} error={errors.companyName}>
          <input
            id={fieldId("companyName")}
            name="companyName"
            autoComplete="organization"
            placeholder={copy.companyPlaceholder}
            className={cn(lineClass, underline("companyName"))}
            {...errorProps("companyName")}
          />
        </Field>

        <Field label={copy.companySize} htmlFor={fieldId("companySize")}>
          <SelectLine id={fieldId("companySize")} name="companySize" options={copy.companySizes} placeholder={copy.select} />
        </Field>

        <Field label={copy.location} htmlFor={fieldId("location")}>
          <SelectLine id={fieldId("location")} name="location" options={cities} placeholder={copy.select} />
        </Field>

        <Field label={copy.service} htmlFor={fieldId("service")}>
          <SelectLine id={fieldId("service")} name="service" options={services} placeholder={copy.select} />
        </Field>

        <Field label={copy.frequency} htmlFor={fieldId("frequency")}>
          <SelectLine id={fieldId("frequency")} name="frequency" options={copy.frequencies} placeholder={copy.select} />
        </Field>

        <Field label={copy.details} htmlFor={fieldId("details")} className="md:col-span-2">
          <textarea
            id={fieldId("details")}
            name="details"
            rows={3}
            maxLength={2000}
            className="h-[5.5rem] w-full resize-none border-0 border-b border-[#979490] bg-transparent p-0 pt-2 text-[0.9375rem] text-ink focus:border-amber focus:outline-none"
          />
        </Field>
      </div>

      <div className="flex flex-col items-center gap-4">
        <button
          type="submit"
          className="inline-flex h-12 w-full items-center justify-center gap-3 rounded-full bg-gold px-6 text-[0.9375rem] font-medium text-ink transition-[filter,transform] hover:-translate-y-px hover:brightness-105 md:h-11 md:w-auto md:px-5"
        >
          {copy.submit}
          <ArrowRightIcon aria-hidden="true" className="size-3.5 rtl:-scale-x-100" />
        </button>
        <p role="status" className={cn("text-center text-xs leading-[1.5]", sent ? "font-medium text-success" : "text-muted-text")}>
          {sent ? copy.sent : copy.note}
        </p>
      </div>
    </form>
  );
}
