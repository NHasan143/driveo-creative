import { env } from "@/config/env";
import type { Locale } from "@/i18n/config";
import { ApiError } from "@/lib/api/http-client";
import { sessionRequest } from "@/lib/api/session-client";

/** Customer account endpoints (backend/account/views.py), snake_case like the booking API. */

export interface AccountUser {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  locale: Locale;
  is_staff: boolean;
  is_superuser: boolean;
}

export interface ProfileInput {
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  locale: Locale;
}

interface SessionResponse {
  user: AccountUser | null;
  csrf_token: string;
}

/** Without the API (mock mode) there are no accounts; reads say "signed out", writes fail. */
function requireApi() {
  if (env.apiMock) throw new ApiError("Accounts need the Driveo API", 0);
}

export async function getSession(): Promise<AccountUser | null> {
  if (env.apiMock) return null;
  return (await sessionRequest<SessionResponse>("/v1/account/session/")).user;
}

export async function signIn(email: string, password: string) {
  requireApi();
  const response = await sessionRequest<SessionResponse>("/v1/account/session/", {
    method: "POST",
    body: { email, password },
  });
  return response.user as AccountUser;
}

export async function register(input: ProfileInput & { password: string }) {
  requireApi();
  const response = await sessionRequest<SessionResponse>("/v1/account/register/", {
    method: "POST",
    body: input,
  });
  return response.user as AccountUser;
}

export async function signOut() {
  requireApi();
  await sessionRequest("/v1/account/session/", { method: "DELETE" });
}

export function updateProfile(input: Partial<ProfileInput>) {
  requireApi();
  return sessionRequest<AccountUser>("/v1/account/profile/", {
    method: "PATCH",
    body: input,
  });
}

export async function changePassword(currentPassword: string, newPassword: string) {
  requireApi();
  await sessionRequest("/v1/account/password/", {
    method: "POST",
    body: { current_password: currentPassword, new_password: newPassword },
  });
}

export async function requestPasswordReset(email: string, locale: Locale) {
  requireApi();
  await sessionRequest("/v1/account/password-reset/", {
    method: "POST",
    body: { email, locale },
  });
}

export async function confirmPasswordReset(uid: string, token: string, newPassword: string) {
  requireApi();
  await sessionRequest("/v1/account/password-reset/confirm/", {
    method: "POST",
    body: { uid, token, new_password: newPassword },
  });
}
