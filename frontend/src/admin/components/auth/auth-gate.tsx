"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, LogOut } from "lucide-react";
import Image from "next/image";
import { useEffect, useId, useState, useSyncExternalStore, type FormEvent, type ReactNode } from "react";
import { Button } from "@/admin/components/ui/button";
import { Field } from "@/admin/components/ui/field";
import { Input } from "@/admin/components/ui/input";
import { Card, CardBody } from "@/admin/components/ui/primitives";
import { getSession, onSignedOut, signIn, signOut, type StaffUser } from "@/admin/lib/admin-api";
import { IS_LOCAL_DEMO } from "@/admin/lib/content";

const sessionKey = ["admin-session"] as const;

const subscribeToNothing = () => () => {};

/** The signed-in staff member, or null. Always null in demo mode, which has no sign-in. */
export function useStaffUser() {
  return useQuery({
    queryKey: sessionKey,
    queryFn: getSession,
    enabled: !IS_LOCAL_DEMO,
    staleTime: Infinity,
    retry: false,
  });
}

/**
 * With the Django API as the content source, shows the sign-in screen until a
 * staff member is signed in. The API enforces this on every request; the gate
 * only keeps the screens honest. Demo mode renders the admin directly.
 *
 * Each admin page wraps its own content in this gate. A layout-level gate would
 * drop the page segment from the prerendered shell.
 */
export function AuthGate({ children }: { children: ReactNode }) {
  if (IS_LOCAL_DEMO) return children;
  return <ApiAuthGate>{children}</ApiAuthGate>;
}

function ApiAuthGate({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const session = useStaffUser();

  // Any request the API refuses as "not signed in" (e.g. an expired session) re-checks the session.
  useEffect(
    () => onSignedOut(() => queryClient.setQueryData(sessionKey, null)),
    [queryClient],
  );

  // The page hydrates after the layout, whose header may already have loaded the session.
  // Match the server's "checking" render during hydration, then show the real state.
  const hydrated = useSyncExternalStore(subscribeToNothing, () => true, () => false);

  if (!hydrated || session.isPending) {
    return (
      <div className="grid min-h-[60svh] place-items-center text-sm text-muted-foreground">Checking your sign-in…</div>
    );
  }
  if (session.isError) {
    return (
      <AuthScreen>
        <p role="alert" className="flex items-start gap-2 text-sm text-danger">
          <AlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          {(session.error as Error).message}
        </p>
        <Button className="mt-4 w-full" onClick={() => session.refetch()}>
          Try again
        </Button>
      </AuthScreen>
    );
  }
  if (!session.data) return <SignInScreen />;
  return children;
}

function AuthScreen({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-[60svh] place-items-center py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center justify-center gap-3">
          <span className="relative size-10 overflow-hidden rounded-md border border-border">
            <Image src="/images/logo.jpg" alt="" fill sizes="40px" className="object-cover" priority />
          </span>
          <span className="leading-tight">
            <span className="block font-display text-lg font-medium">Driveo</span>
            <span className="block text-[0.65rem] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
              Admin
            </span>
          </span>
        </div>
        <Card>
          <CardBody className="p-6">{children}</CardBody>
        </Card>
      </div>
    </div>
  );
}

function SignInScreen() {
  const queryClient = useQueryClient();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const usernameId = useId();
  const passwordId = useId();
  const mutation = useMutation({
    mutationFn: () => signIn(username, password),
    onSuccess: (user: StaffUser) => {
      queryClient.setQueryData(sessionKey, user);
      // Content queries may have failed while signed out.
      void queryClient.invalidateQueries({ queryKey: ["content"] });
    },
  });

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    mutation.mutate();
  }

  return (
    <AuthScreen>
      <h1 className="text-lg font-bold">Sign in</h1>
      <p className="mt-1 text-sm text-muted-foreground">Use your Driveo staff account.</p>
      <form onSubmit={onSubmit} className="mt-5 grid gap-4">
        <Field label="Username or email" htmlFor={usernameId}>
          <Input
            id={usernameId}
            autoComplete="username"
            required
            value={username}
            onChange={(event) => setUsername(event.target.value)}
          />
        </Field>
        <Field label="Password" htmlFor={passwordId}>
          <Input
            id={passwordId}
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </Field>
        {mutation.isError && (
          <p role="alert" className="flex items-start gap-2 text-sm text-danger">
            <AlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            {mutation.error.message}
          </p>
        )}
        <Button type="submit" size="lg" loading={mutation.isPending}>
          Sign in
        </Button>
      </form>
    </AuthScreen>
  );
}

/** Header button: signs out and returns to the sign-in screen. Hidden in demo mode. */
export function SignOutButton() {
  const queryClient = useQueryClient();
  const { data: user } = useStaffUser();
  const mutation = useMutation({
    mutationFn: signOut,
    onSettled: () => {
      queryClient.setQueryData(sessionKey, null);
      queryClient.removeQueries({ queryKey: ["content"] });
    },
  });
  if (!user) return null;
  return (
    <Button
      variant="ghost"
      size="sm"
      title={`Signed in as ${user.name}`}
      loading={mutation.isPending}
      onClick={() => mutation.mutate()}
    >
      <LogOut aria-hidden="true" />
      Sign out
    </Button>
  );
}
