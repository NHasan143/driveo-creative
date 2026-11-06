"use client";

import { useEffect, useSyncExternalStore } from "react";
import { getSession, type AccountUser } from "./api";

/**
 * Who is signed in, shared by every component on the page (account pages, the
 * booking form). Loaded once per page load; sign in/out updates it directly.
 */

interface AccountState {
  status: "loading" | "ready";
  user: AccountUser | null;
}

const LOADING: AccountState = { status: "loading", user: null };

let state = LOADING;
let loading: Promise<void> | null = null;
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function setAccountUser(user: AccountUser | null) {
  state = { status: "ready", user };
  listeners.forEach((listener) => listener());
}

function loadAccount() {
  loading ??= getSession()
    .then(setAccountUser)
    // Can't reach the API: treat as signed out; the forms report their own errors.
    .catch(() => setAccountUser(null));
  return loading;
}

export function useAccount(): AccountState {
  const current = useSyncExternalStore(
    subscribe,
    () => state,
    () => LOADING,
  );
  useEffect(() => {
    void loadAccount();
  }, []);
  return current;
}
