"use client";

import { Search, Users } from "lucide-react";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Button } from "@/admin/components/ui/button";
import { Input } from "@/admin/components/ui/input";
import { Badge, Card, EmptyState, Skeleton } from "@/admin/components/ui/primitives";
import { IS_LOCAL_DEMO } from "@/admin/lib/content";
import { formatDate, fullName, useCustomers } from "@/admin/lib/people";
import { NeedsApi } from "./needs-api";

export function CustomersList() {
  if (IS_LOCAL_DEMO) return <NeedsApi />;
  return <CustomersTable />;
}

function CustomersTable() {
  const [draft, setDraft] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const { data, isPending, isError, error, isFetching } = useCustomers(search, page);

  function onSearch(event: FormEvent) {
    event.preventDefault();
    setSearch(draft.trim());
    setPage(1);
  }

  const pages = data ? Math.max(1, Math.ceil(data.count / 25)) : 1;

  return (
    <Card>
      <form onSubmit={onSearch} className="flex flex-wrap items-center gap-2 border-b border-border p-4">
        <div className="relative min-w-56 flex-1">
          <Search aria-hidden="true" className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Search by name, email or phone"
            aria-label="Search customers"
            className="ps-9"
          />
        </div>
        <Button type="submit" variant="secondary">
          Search
        </Button>
        {data && (
          <span className="ms-auto text-xs text-muted-foreground">
            {data.count} {data.count === 1 ? "customer" : "customers"}
          </span>
        )}
      </form>

      {isPending ? (
        <div className="space-y-3 p-4">
          {[0, 1, 2].map((row) => (
            <Skeleton key={row} className="h-10" />
          ))}
        </div>
      ) : isError ? (
        <p role="alert" className="p-6 text-sm text-danger">
          {(error as Error).message}
        </p>
      ) : data.results.length === 0 ? (
        <EmptyState
          icon={<Users aria-hidden="true" />}
          title={search ? "No customers match" : "No customers yet"}
          description={
            search
              ? "Try part of a name, an email or a phone number."
              : "Customers appear here when they create an account on the website."
          }
        />
      ) : (
        <div className={isFetching ? "opacity-60 transition-opacity" : undefined}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-start text-xs text-muted-foreground">
                <tr className="border-b border-border">
                  <th className="px-4 py-2.5 text-start font-semibold">Customer</th>
                  <th className="px-4 py-2.5 text-start font-semibold">Phone</th>
                  <th className="px-4 py-2.5 text-end font-semibold">Bookings</th>
                  <th className="px-4 py-2.5 text-start font-semibold">Last booking</th>
                  <th className="px-4 py-2.5 text-start font-semibold">Joined</th>
                  <th className="px-4 py-2.5 text-start font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.results.map((customer) => (
                  <tr key={customer.id} className="border-b border-border last:border-0 hover:bg-surface-muted">
                    <td className="px-4 py-3">
                      <Link href={`/admin/customers/${customer.id}`} className="font-semibold hover:text-primary">
                        {fullName(customer)}
                      </Link>
                      <span className="block text-xs text-muted-foreground">{customer.email}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap" dir="ltr">
                      {customer.phone || "—"}
                    </td>
                    <td className="px-4 py-3 text-end tabular-nums">{customer.booking_count}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{formatDate(customer.last_booking_at)}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{formatDate(customer.date_joined)}</td>
                    <td className="px-4 py-3">
                      <Badge tone={customer.is_active ? "success" : "neutral"} dot>
                        {customer.is_active ? "Active" : "Deactivated"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {pages > 1 && (
            <div className="flex items-center justify-between gap-2 border-t border-border p-3 text-xs text-muted-foreground">
              <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                Previous
              </Button>
              <span>
                Page {page} of {pages}
              </span>
              <Button variant="secondary" size="sm" disabled={page >= pages} onClick={() => setPage(page + 1)}>
                Next
              </Button>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
