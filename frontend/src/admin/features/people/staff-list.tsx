"use client";

import { KeyRound, ShieldCheck, UserPlus } from "lucide-react";
import { Dialog } from "radix-ui";
import { useId, useState, type FormEvent, type ReactNode } from "react";
import { toast } from "sonner";
import { useStaffUser } from "@/admin/components/auth/auth-gate";
import { PageHeader } from "@/admin/components/layout/page-header";
import { Button, buttonClass } from "@/admin/components/ui/button";
import { Field } from "@/admin/components/ui/field";
import { Input } from "@/admin/components/ui/input";
import { Badge, Card, EmptyState, Skeleton, Switch } from "@/admin/components/ui/primitives";
import { IS_LOCAL_DEMO } from "@/admin/lib/content";
import { ContentValidationError } from "@/admin/lib/content/repository";
import {
  formatDate,
  fullName,
  useCreateStaffAccount,
  useSetStaffPassword,
  useStaffAccounts,
  useUpdateStaffAccount,
  type StaffAccount,
} from "@/admin/lib/people";
import { NeedsApi } from "./needs-api";

export function StaffScreen() {
  const { data: me } = useStaffUser();
  const [adding, setAdding] = useState(false);

  if (IS_LOCAL_DEMO) {
    return (
      <>
        <PageHeader title="Staff" />
        <NeedsApi />
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Staff"
        description="Everyone who can sign in to this admin. Superusers also manage staff accounts."
        actions={
          me?.isSuperuser && (
            <Button onClick={() => setAdding(true)}>
              <UserPlus aria-hidden="true" />
              Add staff member
            </Button>
          )
        }
      />
      {me && !me.isSuperuser ? (
        <Card>
          <EmptyState
            icon={<ShieldCheck aria-hidden="true" />}
            title="Superusers only"
            description="Ask a superuser to add, change or remove staff accounts."
          />
        </Card>
      ) : (
        <StaffTable myUsername={me?.username} />
      )}
      <AddStaffDialog open={adding} onOpenChange={setAdding} />
    </>
  );
}

function StaffTable({ myUsername }: { myUsername?: string }) {
  const { data, isPending, isError, error } = useStaffAccounts();
  const update = useUpdateStaffAccount();
  const [passwordFor, setPasswordFor] = useState<StaffAccount | null>(null);

  async function change(account: StaffAccount, changes: Partial<StaffAccount>, success: string) {
    try {
      await update.mutateAsync({ id: account.id, ...changes });
      toast.success(success);
    } catch (caught) {
      toast.error("Couldn't change the account", { description: (caught as Error).message });
    }
  }

  if (isPending) return <Skeleton className="h-48" />;
  if (isError) {
    return (
      <p role="alert" className="text-sm text-danger">
        {(error as Error).message}
      </p>
    );
  }

  return (
    <Card>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-xs text-muted-foreground">
            <tr className="border-b border-border">
              <th className="px-4 py-2.5 text-start font-semibold">Name</th>
              <th className="px-4 py-2.5 text-start font-semibold">Username</th>
              <th className="px-4 py-2.5 text-start font-semibold">Last sign-in</th>
              <th className="px-4 py-2.5 text-start font-semibold">Superuser</th>
              <th className="px-4 py-2.5 text-start font-semibold">Active</th>
              <th className="px-4 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {data.map((account) => {
              const isMe = account.username === myUsername;
              return (
                <tr key={account.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">
                    <span className="font-semibold">{fullName(account)}</span>
                    {isMe && (
                      <Badge tone="primary" className="ms-2">
                        You
                      </Badge>
                    )}
                    <span className="block text-xs text-muted-foreground">{account.email}</span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{account.username}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{formatDate(account.last_login, true)}</td>
                  <td className="px-4 py-3">
                    <Switch
                      label={`Superuser: ${fullName(account)}`}
                      checked={account.is_superuser}
                      disabled={isMe || update.isPending}
                      onCheckedChange={(checked) =>
                        change(account, { is_superuser: checked }, checked ? "Made a superuser" : "Superuser access removed")
                      }
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Switch
                      label={`Active: ${fullName(account)}`}
                      checked={account.is_active}
                      disabled={isMe || update.isPending}
                      onCheckedChange={(checked) =>
                        change(account, { is_active: checked }, checked ? "Account reactivated" : "Account deactivated")
                      }
                    />
                  </td>
                  <td className="px-4 py-3 text-end">
                    <Button variant="ghost" size="sm" onClick={() => setPasswordFor(account)}>
                      <KeyRound aria-hidden="true" />
                      Set password
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <SetPasswordDialog account={passwordFor} onClose={() => setPasswordFor(null)} />
    </Card>
  );
}

function FormDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px]" />
        <Dialog.Content className="fixed top-1/2 left-1/2 z-50 max-h-[90svh] w-[min(30rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border border-border bg-surface p-6 shadow-pop">
          <Dialog.Title className="text-base font-bold">{title}</Dialog.Title>
          <Dialog.Description className="mt-1 text-sm text-muted-foreground">{description}</Dialog.Description>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function AddStaffDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const create = useCreateStaffAccount();
  const [error, setError] = useState<{ field?: string; message: string } | null>(null);
  const [superuser, setSuperuser] = useState(false);
  const id = useId();

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const text = (name: string) => String(data.get(name) ?? "").trim();
    setError(null);
    try {
      const account = await create.mutateAsync({
        username: text("username"),
        email: text("email"),
        first_name: text("first_name"),
        last_name: text("last_name"),
        password: String(data.get("password") ?? ""),
        is_superuser: superuser,
      });
      toast.success(`${fullName(account)} can now sign in`, {
        description: "Share the password with them privately; they can change it under My account.",
      });
      setSuperuser(false);
      onOpenChange(false);
    } catch (caught) {
      setError({
        field: caught instanceof ContentValidationError ? caught.field : undefined,
        message: (caught as Error).message,
      });
    }
  }

  const fieldError = (name: string) => (error?.field === name ? error.message : undefined);

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Add a staff member"
      description="They can sign in to this admin and to Django's admin for quote requests."
    >
      <form onSubmit={onSubmit} className="mt-5 grid gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="First name" htmlFor={`${id}-first`} required error={fieldError("first_name")}>
            <Input id={`${id}-first`} name="first_name" required maxLength={150} />
          </Field>
          <Field label="Last name" htmlFor={`${id}-last`} error={fieldError("last_name")}>
            <Input id={`${id}-last`} name="last_name" maxLength={150} />
          </Field>
        </div>
        <Field label="Email" htmlFor={`${id}-email`} required error={fieldError("email")}>
          <Input id={`${id}-email`} name="email" type="email" required maxLength={254} autoComplete="off" />
        </Field>
        <Field
          label="Username"
          htmlFor={`${id}-username`}
          required
          hint="Letters, digits and @/./+/-/_ only. They can also sign in with their email."
          error={fieldError("username")}
        >
          <Input id={`${id}-username`} name="username" required maxLength={150} autoComplete="off" />
        </Field>
        <Field
          label="Temporary password"
          htmlFor={`${id}-password`}
          required
          hint="At least 8 characters, not common, not only numbers."
          error={fieldError("password")}
        >
          <Input id={`${id}-password`} name="password" type="password" required minLength={8} autoComplete="new-password" />
        </Field>
        <label className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2">
          <span className="text-sm font-semibold">Superuser (can manage staff)</span>
          <Switch label="Superuser" checked={superuser} onCheckedChange={setSuperuser} />
        </label>
        {error && !error.field && (
          <p role="alert" className="text-sm text-danger">
            {error.message}
          </p>
        )}
        <div className="mt-2 flex justify-end gap-2">
          <Dialog.Close className={buttonClass("secondary")}>Cancel</Dialog.Close>
          <Button type="submit" loading={create.isPending}>
            Add staff member
          </Button>
        </div>
      </form>
    </FormDialog>
  );
}

function SetPasswordDialog({ account, onClose }: { account: StaffAccount | null; onClose: () => void }) {
  const setPassword = useSetStaffPassword();
  const [error, setError] = useState<string | null>(null);
  const id = useId();

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!account) return;
    const password = String(new FormData(event.currentTarget).get("password") ?? "");
    setError(null);
    try {
      await setPassword.mutateAsync({ id: account.id, password });
      toast.success(`New password set for ${fullName(account)}`);
      onClose();
    } catch (caught) {
      setError((caught as Error).message);
    }
  }

  return (
    <FormDialog
      open={account !== null}
      onOpenChange={(open) => {
        if (!open) {
          setError(null);
          onClose();
        }
      }}
      title={account ? `Set a password for ${fullName(account)}` : "Set a password"}
      description="Use this when someone is locked out. Their other signed-in sessions end."
    >
      <form onSubmit={onSubmit} className="mt-5 grid gap-4">
        <Field label="New password" htmlFor={`${id}-password`} required error={error ?? undefined}>
          <Input id={`${id}-password`} name="password" type="password" required minLength={8} autoComplete="new-password" />
        </Field>
        <div className="flex justify-end gap-2">
          <Dialog.Close className={buttonClass("secondary")}>Cancel</Dialog.Close>
          <Button type="submit" loading={setPassword.isPending}>
            Set password
          </Button>
        </div>
      </form>
    </FormDialog>
  );
}
