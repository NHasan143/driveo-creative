"use client";

import { Clock, Save, Trash2, Undo2 } from "lucide-react";
import { useState, type ReactNode } from "react";
import {
  FormProvider,
  useWatch,
  type FieldErrors,
  type FieldValues,
  type UseFormReturn,
} from "react-hook-form";
import { toast } from "sonner";
import { PageHeader } from "@/admin/components/layout/page-header";
import { Button } from "@/admin/components/ui/button";
import { ConfirmDialog } from "@/admin/components/ui/confirm-dialog";
import { Badge, Card, CardBody, CardHeader, Switch } from "@/admin/components/ui/primitives";
import { coverageOf, percent } from "@/admin/lib/content/completeness";
import { DEFAULT_LOCALE, LOCALE_LABELS, LOCALES, type Locale } from "@/admin/lib/content/types";
import { formatDateTime } from "@/admin/lib/format";
import { cn } from "@/admin/lib/cn";
import { FormLocaleProvider, LanguageSwitcher } from "./form-locale";
import { useUnsavedChangesWarning } from "./use-unsaved-changes";

interface EditorShellProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  title: string;
  description?: ReactNode;
  breadcrumbs: { label: string; href: string }[];
  isNew: boolean;
  saving: boolean;
  onSubmit: (values: T) => Promise<void>;
  updatedAt?: string;
  /** Show the Published/Draft switch, bound to the `status` field. */
  withStatus?: boolean;
  /** Noun for messages, e.g. "service". */
  noun: string;
  onDelete?: () => Promise<void>;
  deleteWarning?: ReactNode;
  children: ReactNode;
}

/** First error path in a react-hook-form errors object, e.g. "facts.1.label.en". */
function firstErrorPath(errors: FieldErrors, prefix = ""): string | null {
  for (const [key, value] of Object.entries(errors)) {
    if (!value) continue;
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof (value as { message?: unknown }).message === "string") return path;
    const nested = firstErrorPath(value as FieldErrors, path);
    if (nested) return nested;
  }
  return null;
}

/**
 * Shared editor frame: language switcher, two-column layout with a publishing
 * panel, translation progress, save/discard, delete, and unsaved-change protection.
 */
export function EditorShell<T extends FieldValues>({
  form,
  title,
  description,
  breadcrumbs,
  isNew,
  saving,
  onSubmit,
  updatedAt,
  withStatus = true,
  noun,
  onDelete,
  deleteWarning,
  children,
}: EditorShellProps<T>) {
  const [locale, setLocale] = useState<Locale>(DEFAULT_LOCALE);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const values = useWatch({ control: form.control });
  const coverage = coverageOf(values);
  const { isDirty } = form.formState;
  useUnsavedChangesWarning(isDirty && !saving);

  const submit = form.handleSubmit(onSubmit, (errors) => {
    const path = firstErrorPath(errors);
    const errorLocale = LOCALES.find((code) => path?.endsWith(`.${code}`));
    if (errorLocale && errorLocale !== locale) setLocale(errorLocale);
    toast.error("Please check the highlighted fields", {
      description: errorLocale ? `Missing or invalid ${LOCALE_LABELS[errorLocale]} text.` : undefined,
    });
    // Focus after the language switch has rendered the field.
    if (path) setTimeout(() => form.setFocus(path as never), 50);
  });

  const status = useWatch({ control: form.control, name: "status" as never }) as unknown as string | undefined;

  const saveButton = (
    <Button type="submit" loading={saving} disabled={!isDirty && !isNew}>
      <Save aria-hidden="true" />
      {isNew ? `Create ${noun}` : "Save changes"}
    </Button>
  );

  return (
    <FormProvider {...form}>
      {/* React hoists this into <head>; editor routes are client-rendered, so there is no static metadata. */}
      <title>{`${title} · Driveo Admin`}</title>
      <form onSubmit={submit} noValidate className="pb-24 xl:pb-0">
        <PageHeader
          title={title}
          description={description}
          breadcrumbs={breadcrumbs}
          actions={
            <div className="hidden items-center gap-2 xl:flex">
              {isDirty && <Badge tone="warning" dot>Unsaved changes</Badge>}
              {saveButton}
            </div>
          }
        />

        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <LanguageSwitcher value={locale} onChange={setLocale} coverage={coverage} />
          <p className="text-xs text-muted-foreground">
            English is required. Other languages fall back to English on the website until translated.
          </p>
        </div>

        <FormLocaleProvider locale={locale}>
          <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_19rem]">
            <div className="grid gap-6">{children}</div>

            <aside className="grid gap-6 xl:sticky xl:top-20">
              <Card>
                <CardHeader title="Publishing" />
                <CardBody className="gap-4">
                  {withStatus && (
                    <label className="flex cursor-pointer items-center justify-between gap-3">
                      <span>
                        <span className="block text-sm font-semibold">
                          {status === "published" ? "Published" : "Draft"}
                        </span>
                        <span className="block text-xs text-muted-foreground">
                          {status === "published" ? "Visible on the website" : "Hidden from the website"}
                        </span>
                      </span>
                      <Switch
                        label="Published"
                        checked={status === "published"}
                        onCheckedChange={(checked) =>
                          form.setValue("status" as never, (checked ? "published" : "draft") as never, {
                            shouldDirty: true,
                          })
                        }
                      />
                    </label>
                  )}
                  {updatedAt && (
                    <p className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock aria-hidden="true" className="size-3.5" />
                      Last saved {formatDateTime(updatedAt)}
                    </p>
                  )}
                  <div className="grid gap-2">
                    {saveButton}
                    {isDirty && !isNew && (
                      <Button variant="ghost" onClick={() => form.reset()}>
                        <Undo2 aria-hidden="true" />
                        Discard changes
                      </Button>
                    )}
                  </div>
                </CardBody>
              </Card>

              <Card>
                <CardHeader title="Translations" description="Share of text fields filled in per language." />
                <CardBody className="gap-3">
                  {LOCALES.map((code) => {
                    const done = percent(coverage[code]);
                    return (
                      <button
                        key={code}
                        type="button"
                        onClick={() => setLocale(code)}
                        className="grid cursor-pointer gap-1.5 rounded-md text-start"
                      >
                        <span className="flex items-center justify-between text-xs">
                          <span className={cn("font-semibold", code === locale && "text-primary")} lang={code}>
                            {LOCALE_LABELS[code]}
                          </span>
                          <span className="text-muted-foreground tabular-nums">
                            {coverage[code].filled}/{coverage[code].total}
                          </span>
                        </span>
                        <span className="h-1.5 overflow-hidden rounded-full bg-surface-muted">
                          <span
                            className={cn("block h-full rounded-full", done === 100 ? "bg-success" : "bg-warning")}
                            style={{ width: `${done}%` }}
                          />
                        </span>
                      </button>
                    );
                  })}
                </CardBody>
              </Card>

              {onDelete && !isNew && (
                <Card className="border-danger/25">
                  <CardBody className="gap-3">
                    <div>
                      <p className="text-sm font-semibold">Delete this {noun}</p>
                      <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                        Removes it from the website. This can&apos;t be undone.
                      </p>
                    </div>
                    <Button variant="danger-ghost" className="justify-start" onClick={() => setConfirmDelete(true)}>
                      <Trash2 aria-hidden="true" />
                      Delete {noun}
                    </Button>
                  </CardBody>
                </Card>
              )}
            </aside>
          </div>
        </FormLocaleProvider>

        {/* Phones and tablets: actions stay within thumb reach. */}
        <div className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-between gap-3 border-t border-border bg-surface/95 px-4 py-3 backdrop-blur-md lg:start-64 xl:hidden">
          <span className="text-xs font-medium text-muted-foreground">
            {isDirty ? "You have unsaved changes" : isNew ? `New ${noun}` : "All changes saved"}
          </span>
          {saveButton}
        </div>
      </form>

      {onDelete && (
        <ConfirmDialog
          open={confirmDelete}
          onOpenChange={setConfirmDelete}
          title={`Delete this ${noun}?`}
          description={deleteWarning ?? "It will be removed from the website. This can't be undone."}
          confirmLabel={`Delete ${noun}`}
          busy={deleting}
          onConfirm={async () => {
            setDeleting(true);
            try {
              await onDelete();
            } finally {
              setDeleting(false);
              setConfirmDelete(false);
            }
          }}
        />
      )}
    </FormProvider>
  );
}
