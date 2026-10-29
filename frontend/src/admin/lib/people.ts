"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminRequest } from "./admin-api";

/**
 * Customers and staff accounts (backend/account/staff_views.py) and the signed-in
 * person's own profile (backend/account/views.py). Snake_case, like the API.
 */

export interface Customer {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  locale: string;
  is_active: boolean;
  date_joined: string;
  last_login: string | null;
  quote_count: number;
  last_request_at: string | null;
}

export interface CustomerQuoteRequest {
  id: number;
  reference: string;
  status: "new" | "contacted" | "quoted" | "closed";
  created_at: string;
  city: string;
  service_type: string;
  vehicle_class: string;
  journey_date: string;
  journey_time: string;
  pickup_location: string;
  destination: string;
}

export interface CustomerDetail extends Customer {
  quote_requests: CustomerQuoteRequest[];
}

interface Page<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface StaffAccount {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  is_active: boolean;
  is_superuser: boolean;
  date_joined: string;
  last_login: string | null;
}

export interface NewStaffAccount {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  is_superuser: boolean;
}

export interface MyProfile {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  locale: string;
}

const keys = {
  customers: (search: string, page: number) => ["people", "customers", search, page] as const,
  customer: (id: string) => ["people", "customer", id] as const,
  staff: ["people", "staff"] as const,
  profile: ["people", "profile"] as const,
};

export function useCustomers(search: string, page: number) {
  const query = new URLSearchParams({ page: String(page), ...(search && { search }) });
  return useQuery({
    queryKey: keys.customers(search, page),
    queryFn: () => adminRequest<Page<Customer>>(`/v1/staff/customers/?${query}`),
    placeholderData: keepPreviousData,
  });
}

export function useCustomer(id: string) {
  return useQuery({
    queryKey: keys.customer(id),
    queryFn: () => adminRequest<CustomerDetail>(`/v1/staff/customers/${encodeURIComponent(id)}/`),
  });
}

export function useSetCustomerActive(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (isActive: boolean) =>
      adminRequest<Customer>(`/v1/staff/customers/${id}/`, { method: "PATCH", body: { is_active: isActive } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["people"] }),
  });
}

export function useStaffAccounts() {
  return useQuery({ queryKey: keys.staff, queryFn: () => adminRequest<StaffAccount[]>("/v1/staff/users/") });
}

export function useCreateStaffAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (account: NewStaffAccount) =>
      adminRequest<StaffAccount>("/v1/staff/users/", { method: "POST", body: account }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.staff }),
  });
}

export function useUpdateStaffAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...changes }: Partial<StaffAccount> & { id: number }) =>
      adminRequest<StaffAccount>(`/v1/staff/users/${id}/`, { method: "PATCH", body: changes }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.staff }),
  });
}

export function useSetStaffPassword() {
  return useMutation({
    mutationFn: ({ id, password }: { id: number; password: string }) =>
      adminRequest(`/v1/staff/users/${id}/password/`, { method: "POST", body: { password } }),
  });
}

export function useMyProfile() {
  return useQuery({ queryKey: keys.profile, queryFn: () => adminRequest<MyProfile>("/v1/account/profile/") });
}

export function useUpdateMyProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (changes: Partial<Omit<MyProfile, "id">>) =>
      adminRequest<MyProfile>("/v1/account/profile/", { method: "PATCH", body: changes }),
    onSuccess: (profile) => {
      queryClient.setQueryData(keys.profile, profile);
      // The header greets by name.
      void queryClient.invalidateQueries({ queryKey: ["admin-session"] });
    },
  });
}

export function useChangeMyPassword() {
  return useMutation({
    mutationFn: (passwords: { current_password: string; new_password: string }) =>
      adminRequest("/v1/account/password/", { method: "POST", body: passwords }),
  });
}

const dateFormat = new Intl.DateTimeFormat("en-GB", { dateStyle: "medium" });
const dateTimeFormat = new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" });

export function formatDate(value: string | null, withTime = false) {
  if (!value) return "—";
  return (withTime ? dateTimeFormat : dateFormat).format(new Date(value));
}

export function fullName(person: { first_name: string; last_name: string; email: string }) {
  return `${person.first_name} ${person.last_name}`.trim() || person.email;
}
