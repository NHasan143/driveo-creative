"use client";

import { Link2 } from "lucide-react";
import { useEffect, useRef } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { Field } from "@/admin/components/ui/field";
import { Input } from "@/admin/components/ui/input";

export function slugify(text: string) {
  return text
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

interface SlugFieldProps {
  /** Field the slug follows until edited by hand, e.g. "title.en". */
  source: string;
  /** Public URL prefix shown in the hint, e.g. "/services/". */
  prefix: string;
  /** Only new records follow the source; renaming a live URL would break links. */
  autoFollow: boolean;
}

export function SlugField({ source, prefix, autoFollow }: SlugFieldProps) {
  const { register, setValue, getFieldState, formState } = useFormContext();
  const sourceValue = (useWatch({ name: source }) as string) ?? "";
  const slug = (useWatch({ name: "slug" }) as string) ?? "";
  const editedByHand = useRef(false);

  useEffect(() => {
    if (autoFollow && !editedByHand.current) {
      setValue("slug", slugify(sourceValue), { shouldDirty: true, shouldValidate: formState.isSubmitted });
    }
  }, [autoFollow, sourceValue, setValue, formState.isSubmitted]);

  const { onChange, ...rest } = register("slug");
  return (
    <Field
      label="URL slug"
      htmlFor="slug"
      required
      error={getFieldState("slug", formState).error?.message}
      hint={
        <span className="flex items-center gap-1.5">
          <Link2 aria-hidden="true" className="size-3.5" />
          {prefix}
          <span className="font-semibold text-foreground">{slug || "…"}</span>
          {!autoFollow && <span>· changing it changes the page address</span>}
        </span>
      }
    >
      <Input
        id="slug"
        dir="ltr"
        spellCheck={false}
        autoComplete="off"
        {...rest}
        onChange={(event) => {
          editedByHand.current = true;
          onChange(event);
        }}
      />
    </Field>
  );
}
