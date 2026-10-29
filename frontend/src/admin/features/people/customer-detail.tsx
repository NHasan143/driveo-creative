"use client";

import { ExternalLink, Inbox } from "lucide-react";
import { useParams } from "next/navigation";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/admin/components/layout/page-header";
import { Button } from "@/admin/components/ui/button";
import { ConfirmDialog } from "@/admin/components/ui/confirm-dialog";
import { Badge, Card, CardBody, CardHeader, EmptyState, Skeleton } from "@/admin/components/ui/primitives";
import { IS_LOCAL_DEMO } from "@/admin/lib/content";
import { formatDate, fullName, useCustomer, useSetCustomerActive, type CustomerDetail } from "@/admin/lib/people";
import { env } from "@/config/env";
import { en } from "@/i18n/dictionaries/en";
import { hasLocale, localeMeta } from "@/i18n/config";
import { NeedsApi } from "./needs-api";

const STATUS = {
  new: { label: "New", tone: "primary" },
  contacted: { label: "Contacted", tone: "warning" },
  quoted: { label: "Quoted", tone: "success" },
  closed: { label: "Closed", tone: "neutral" },
} as const;

/** Quote requests are worked on in Django's admin, on the API's own origin. */
function djangoAdminUrl(quoteId: number) {
  return `${new URL(env.apiBaseUrl).origin}/admin/quotes/quoterequest/${quoteId}/change/`;
}

export function CustomerDetailScreen() {
  const { id } = useParams<{ id: string }>();
  if (IS_LOCAL_DEMO) return <NeedsApi />;
  return <CustomerLoader id={id} />;
}

function CustomerLoader({ id }: { id: string }) {
  const { data, isPending, isError, error } = useCustomer(id);
  if (isPending) return <Skeleton className="h-64" />;
  if (isError) {
    return (
      <p role="alert" className="text-sm text-danger">
        {(error as Error).message}
      </p>
    );
  }
  return <CustomerView customer={data} />;
}

function CustomerView({ customer }: { customer: CustomerDetail }) {
  const setActive = useSetCustomerActive(customer.id);
  const [confirmOpen, setConfirmOpen] = useState(false);

  async function toggleActive() {
    try {
      await setActive.mutateAsync(!customer.is_active);
      toast.success(customer.is_active ? "Account deactivated" : "Account reactivated");
    } catch (error) {
      toast.error("Couldn't change the account", { description: (error as Error).message });
    } finally {
      setConfirmOpen(false);
    }
  }

  const language = hasLocale(customer.locale) ? localeMeta[customer.locale].label : customer.locale;

  return (
    <>
      <PageHeader
        title={fullName(customer)}
        breadcrumbs={[{ label: "Customers", href: "/admin/customers" }]}
        actions={
          customer.is_active ? (
            <Button variant="danger-ghost" onClick={() => setConfirmOpen(true)}>
              Deactivate account
            </Button>
          ) : (
            <Button variant="secondary" onClick={toggleActive} loading={setActive.isPending}>
              Reactivate account
            </Button>
          )
        }
      />

      <div className="grid items-start gap-6 lg:grid-cols-[20rem_minmax(0,1fr)]">
        <Card>
          <CardHeader title="Details" />
          <CardBody>
            <dl className="grid gap-3 text-sm">
              <Detail label="Email">{customer.email}</Detail>
              <Detail label="Phone">
                <span dir="ltr">{customer.phone || "—"}</span>
              </Detail>
              <Detail label="Email language">{language}</Detail>
              <Detail label="Joined">{formatDate(customer.date_joined)}</Detail>
              <Detail label="Last sign-in">{formatDate(customer.last_login, true)}</Detail>
              <Detail label="Status">
                <Badge tone={customer.is_active ? "success" : "neutral"} dot>
                  {customer.is_active ? "Active" : "Deactivated"}
                </Badge>
              </Detail>
            </dl>
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Quote requests"
            description="Requests sent while signed in. Reply and update them in the Django admin."
          />
          {customer.quote_requests.length === 0 ? (
            <EmptyState
              icon={<Inbox aria-hidden="true" />}
              title="No requests yet"
              description="Requests this customer sends while signed in will appear here."
            />
          ) : (
            <ul className="divide-y divide-border">
              {customer.quote_requests.map((request) => (
                <li key={request.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-3 text-sm">
                  <span className="font-mono font-semibold" dir="ltr">
                    {request.reference}
                  </span>
                  <Badge tone={STATUS[request.status].tone}>{STATUS[request.status].label}</Badge>
                  <span className="min-w-0 flex-1 text-muted-foreground">
                    {en.quote.serviceOptions[request.service_type as keyof typeof en.quote.serviceOptions] ??
                      request.service_type}{" "}
                    · {en.cities.names[request.city as keyof typeof en.cities.names] ?? request.city} ·{" "}
                    {formatDate(request.journey_date)} {request.journey_time.slice(0, 5)}
                  </span>
                  <a
                    href={djangoAdminUrl(request.id)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                  >
                    Open <ExternalLink aria-hidden="true" className="size-3.5" />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Deactivate this account?"
        description={`${fullName(customer)} won't be able to sign in on the website. Their quote requests stay. You can reactivate the account later.`}
        confirmLabel="Deactivate"
        busy={setActive.isPending}
        onConfirm={toggleActive}
      />
    </>
  );
}

function Detail({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-semibold text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 break-words">{children}</dd>
    </div>
  );
}
