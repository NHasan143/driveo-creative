"use client";

import { useId, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/admin/components/ui/button";
import { Field } from "@/admin/components/ui/field";
import { Input } from "@/admin/components/ui/input";
import { Card, CardBody, CardHeader, Skeleton } from "@/admin/components/ui/primitives";
import { IS_LOCAL_DEMO } from "@/admin/lib/content";
import { ContentValidationError } from "@/admin/lib/content/repository";
import { useChangeMyPassword, useMyProfile, useUpdateMyProfile, type MyProfile } from "@/admin/lib/people";
import { NeedsApi } from "./needs-api";

type FieldError = { field?: string; message: string } | null;

function toFieldError(caught: unknown): FieldError {
  return {
    field: caught instanceof ContentValidationError ? caught.field : undefined,
    message: (caught as Error).message,
  };
}

export function MyAccount() {
  if (IS_LOCAL_DEMO) return <NeedsApi />;
  return <MyAccountForms />;
}

function MyAccountForms() {
  const { data, isPending, isError, error } = useMyProfile();
  if (isPending) return <Skeleton className="h-72" />;
  if (isError) {
    return (
      <p role="alert" className="text-sm text-danger">
        {(error as Error).message}
      </p>
    );
  }
  return (
    <div className="grid items-start gap-6 lg:grid-cols-2">
      <ProfileCard profile={data} />
      <PasswordCard />
    </div>
  );
}

function ProfileCard({ profile }: { profile: MyProfile }) {
  const update = useUpdateMyProfile();
  const [error, setError] = useState<FieldError>(null);
  const id = useId();

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const text = (name: string) => String(data.get(name) ?? "").trim();
    setError(null);
    try {
      await update.mutateAsync({
        first_name: text("first_name"),
        last_name: text("last_name"),
        email: text("email"),
        phone: text("phone"),
      });
      toast.success("Your details are saved");
    } catch (caught) {
      setError(toFieldError(caught));
    }
  }

  const fieldError = (name: string) => (error?.field === name ? error.message : undefined);

  return (
    <Card>
      <CardHeader title="Your details" description="Shown to other staff. You can sign in with this email." />
      <CardBody>
        <form onSubmit={onSubmit} className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="First name" htmlFor={`${id}-first`} required error={fieldError("first_name")}>
              <Input id={`${id}-first`} name="first_name" required maxLength={150} defaultValue={profile.first_name} />
            </Field>
            <Field label="Last name" htmlFor={`${id}-last`} error={fieldError("last_name")}>
              <Input id={`${id}-last`} name="last_name" maxLength={150} defaultValue={profile.last_name} />
            </Field>
          </div>
          <Field label="Email" htmlFor={`${id}-email`} required error={fieldError("email")}>
            <Input id={`${id}-email`} name="email" type="email" required maxLength={254} defaultValue={profile.email} />
          </Field>
          <Field label="Phone" htmlFor={`${id}-phone`} error={fieldError("phone")}>
            <Input id={`${id}-phone`} name="phone" type="tel" maxLength={40} dir="ltr" defaultValue={profile.phone} />
          </Field>
          {error && !error.field && (
            <p role="alert" className="text-sm text-danger">
              {error.message}
            </p>
          )}
          <div>
            <Button type="submit" loading={update.isPending}>
              Save details
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}

function PasswordCard() {
  const change = useChangeMyPassword();
  const [error, setError] = useState<FieldError>(null);
  const id = useId();

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setError(null);
    try {
      await change.mutateAsync({
        current_password: String(data.get("current_password") ?? ""),
        new_password: String(data.get("new_password") ?? ""),
      });
      form.reset();
      toast.success("Your password is changed", { description: "Your other signed-in sessions have ended." });
    } catch (caught) {
      setError(toFieldError(caught));
    }
  }

  const fieldError = (name: string) => (error?.field === name ? error.message : undefined);

  return (
    <Card>
      <CardHeader title="Change your password" />
      <CardBody>
        <form onSubmit={onSubmit} className="grid gap-4">
          <Field label="Current password" htmlFor={`${id}-current`} required error={fieldError("current_password")}>
            <Input
              id={`${id}-current`}
              name="current_password"
              type="password"
              required
              autoComplete="current-password"
            />
          </Field>
          <Field
            label="New password"
            htmlFor={`${id}-new`}
            required
            hint="At least 8 characters, not common, not only numbers."
            error={fieldError("new_password")}
          >
            <Input id={`${id}-new`} name="new_password" type="password" required minLength={8} autoComplete="new-password" />
          </Field>
          {error && !error.field && (
            <p role="alert" className="text-sm text-danger">
              {error.message}
            </p>
          )}
          <div>
            <Button type="submit" loading={change.isPending}>
              Change password
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}
