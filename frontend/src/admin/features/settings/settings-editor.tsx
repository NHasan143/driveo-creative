"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, MessageCircle, Phone, RotateCcw } from "lucide-react";
import { useState, type ReactNode } from "react";
import { useController, useForm, useFormContext, type FieldPath } from "react-hook-form";
import { toast } from "sonner";
import { EditorShell } from "@/admin/components/form/editor-shell";
import { LocalizedField } from "@/admin/components/form/localized-field";
import { Repeater } from "@/admin/components/form/repeater";
import { Button } from "@/admin/components/ui/button";
import { ConfirmDialog } from "@/admin/components/ui/confirm-dialog";
import { Field } from "@/admin/components/ui/field";
import { Input } from "@/admin/components/ui/input";
import { Card, CardBody, CardHeader, Switch } from "@/admin/components/ui/primitives";
import { ContentValidationError, IS_LOCAL_DEMO } from "@/admin/lib/content";
import { useResetContent, useSaveSettings } from "@/admin/lib/content/hooks";
import type { SiteSettings } from "@/admin/lib/content/types";
import { newTestimonial, settingsSchema, toSettingsForm, type SettingsFormValues } from "./settings-schema";

interface TextFieldProps {
  name: FieldPath<SettingsFormValues>;
  label: string;
  hint?: string;
  type?: string;
  icon?: ReactNode;
  placeholder?: string;
  required?: boolean;
}

function TextField({ name, label, hint, type = "text", icon, placeholder, required }: TextFieldProps) {
  const { register, getFieldState, formState } = useFormContext<SettingsFormValues>();
  const error = getFieldState(name, formState).error?.message;
  const id = name.replace(/\./g, "-");
  return (
    <Field label={label} htmlFor={id} hint={hint} error={error} required={required}>
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground [&_svg]:size-4">
            {icon}
          </span>
        )}
        <Input
          id={id}
          type={type}
          dir="ltr"
          placeholder={placeholder}
          className={icon ? "ps-9" : undefined}
          aria-invalid={error ? true : undefined}
          {...register(name)}
        />
      </div>
    </Field>
  );
}

function PublishedToggle({ index }: { index: number }) {
  const { control } = useFormContext<SettingsFormValues>();
  const { field } = useController({ control, name: `testimonials.${index}.published` });
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-border bg-surface px-3 py-2">
      <span className="text-sm font-semibold">{field.value ? "Shown on the website" : "Hidden"}</span>
      <Switch label="Show on the website" checked={Boolean(field.value)} onCheckedChange={field.onChange} />
    </label>
  );
}

const SOCIAL_FIELDS = [
  { name: "social.instagram", label: "Instagram" },
  { name: "social.linkedin", label: "LinkedIn" },
  { name: "social.facebook", label: "Facebook" },
  { name: "social.tiktok", label: "TikTok" },
  { name: "social.snapchat", label: "Snapchat" },
] as const;

export function SettingsEditor({ settings }: { settings: SiteSettings }) {
  const save = useSaveSettings();
  const reset = useResetContent();
  const [confirmReset, setConfirmReset] = useState(false);

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: toSettingsForm(settings),
    mode: "onTouched",
  });

  async function onSubmit(values: SettingsFormValues) {
    try {
      const saved = await save.mutateAsync(values);
      form.reset(toSettingsForm(saved));
      toast.success("Settings saved");
    } catch (error) {
      if (error instanceof ContentValidationError && error.field) {
        form.setError(error.field as "email", { message: error.message }, { shouldFocus: true });
      } else {
        toast.error("Couldn't save the settings", { description: (error as Error).message });
      }
    }
  }

  return (
    <>
      <EditorShell
        form={form}
        noun="settings"
        isNew={false}
        saving={save.isPending}
        onSubmit={onSubmit}
        updatedAt={settings.updatedAt}
        withStatus={false}
        title="Site settings"
        description="Company details, contact channels, social links and testimonials used across the website."
        breadcrumbs={[]}
      >
        <Card>
          <CardHeader title="Company" />
          <CardBody>
            <TextField name="companyName" label="Company name" required placeholder="Driveo Exclusive Limited" />
            <LocalizedField name="tagline" label="Footer tagline" required maxLength={80} placeholder="Arrive in absolute silence." />
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Contact" description="Shown in the footer and used by the WhatsApp buttons." />
          <CardBody className="sm:grid-cols-2">
            <TextField name="phone" label="Phone" type="tel" required icon={<Phone />} placeholder="+44 330 043 0976" hint="Displayed exactly as typed." />
            <TextField name="email" label="Email" type="email" required icon={<Mail />} placeholder="info@driveoexclusive.com" />
            <TextField
              name="whatsapp"
              label="WhatsApp number"
              type="tel"
              required
              icon={<MessageCircle />}
              placeholder="+443300430976"
              hint="International format, no spaces. WhatsApp chat links use it."
            />
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Social media" description="Leave a network empty to hide its icon." />
          <CardBody className="sm:grid-cols-2">
            {SOCIAL_FIELDS.map((social) => (
              <TextField key={social.name} name={social.name} label={social.label} type="url" placeholder="https://" />
            ))}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Testimonials" description="Only publish real quotes you have permission to use." />
          <CardBody>
            <Repeater
              name="testimonials"
              itemLabel="testimonial"
              max={12}
              createItem={newTestimonial}
              emptyText="No testimonials yet."
              renderItem={(index) => (
                <>
                  <LocalizedField name={`testimonials.${index}.quote`} label="Quote" required multiline rows={3} maxLength={400} />
                  <LocalizedField
                    name={`testimonials.${index}.attribution`}
                    label="Attribution"
                    required
                    maxLength={80}
                    hint="Who said it, without private details, e.g. “Private client · International itinerary”."
                  />
                  <PublishedToggle index={index} />
                </>
              )}
            />
          </CardBody>
        </Card>

        <Card className="border-warning/30">
          <CardHeader
            title={IS_LOCAL_DEMO ? "Demo content" : "Original content"}
            description={
              IS_LOCAL_DEMO
                ? "Everything here is stored in this browser until the admin is connected to the Driveo API."
                : "Loads the website's built-in copy into the database, replacing all services, vehicles, cities and settings. Use it to fill a new database. Superusers only."
            }
          />
          <CardBody>
            <div>
              <Button variant="secondary" onClick={() => setConfirmReset(true)}>
                <RotateCcw aria-hidden="true" />
                {IS_LOCAL_DEMO ? "Restore the website's original content" : "Load the website's original content"}
              </Button>
            </div>
          </CardBody>
        </Card>
      </EditorShell>

      <ConfirmDialog
        open={confirmReset}
        onOpenChange={setConfirmReset}
        title={IS_LOCAL_DEMO ? "Restore the original content?" : "Replace all content?"}
        description={
          IS_LOCAL_DEMO
            ? "All services, vehicles, cities and settings go back to the website's current copy. Your edits in this browser will be lost."
            : "Every service, vehicle, city and setting saved in the database is replaced with the website's built-in copy. This can't be undone."
        }
        confirmLabel={IS_LOCAL_DEMO ? "Restore content" : "Replace content"}
        busy={reset.isPending}
        onConfirm={async () => {
          try {
            await reset.mutateAsync();
            toast.success("Original content restored");
          } catch (error) {
            toast.error("Couldn't restore the content", { description: (error as Error).message });
          } finally {
            setConfirmReset(false);
          }
        }}
      />
    </>
  );
}
