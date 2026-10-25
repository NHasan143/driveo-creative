"use client";

import { Languages } from "lucide-react";
import { useFormContext, useWatch, type FieldValues, type Path } from "react-hook-form";
import { Field } from "@/admin/components/ui/field";
import { Input, Textarea } from "@/admin/components/ui/input";
import { DEFAULT_LOCALE, LOCALE_LABELS } from "@/admin/lib/content/types";
import { useFormLocale } from "./form-locale";

interface LocalizedFieldProps<T extends FieldValues> {
  /** Path to a LocalizedText value, e.g. "title" or "facts.0.label". */
  name: Path<T> | string;
  label: string;
  hint?: string;
  multiline?: boolean;
  rows?: number;
  maxLength?: number;
  placeholder?: string;
  /** English is required for this field. Translations are always optional. */
  required?: boolean;
}

/** Edits one language of a LocalizedText; the language comes from the form's language switcher. */
export function LocalizedField<T extends FieldValues>({
  name,
  label,
  hint,
  multiline = false,
  rows,
  maxLength,
  placeholder,
  required = false,
}: LocalizedFieldProps<T>) {
  const locale = useFormLocale();
  const { register, getFieldState, formState } = useFormContext();
  const path = `${name}.${locale}`;
  const value = (useWatch({ name: path }) as string | undefined) ?? "";
  const english = (useWatch({ name: `${name}.${DEFAULT_LOCALE}` }) as string | undefined) ?? "";
  const error = getFieldState(path, formState).error?.message;
  const id = path.replace(/\./g, "-");
  const isEnglish = locale === DEFAULT_LOCALE;

  const control = {
    id,
    lang: locale,
    dir: locale === "ar" ? ("rtl" as const) : ("ltr" as const),
    placeholder: isEnglish ? placeholder : english || placeholder,
    maxLength,
    "aria-invalid": error ? true : undefined,
    ...register(path),
  };

  return (
    <Field
      label={label}
      htmlFor={id}
      required={required && isEnglish}
      error={error}
      hint={
        !isEnglish && english ? (
          <span className="flex items-start gap-1.5">
            <Languages aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
            <span>
              <span className="font-semibold">English:</span> {english}
            </span>
          </span>
        ) : (
          hint
        )
      }
      aside={
        maxLength ? (
          <span className="tabular-nums">
            {value.length}/{maxLength}
          </span>
        ) : !isEnglish ? (
          LOCALE_LABELS[locale]
        ) : undefined
      }
    >
      {multiline ? <Textarea rows={rows} {...control} /> : <Input {...control} />}
    </Field>
  );
}
